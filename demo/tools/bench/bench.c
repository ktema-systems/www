// The two baselines a reader can check the engine against, over the same records.
//
//   append-log   one file of fixed-width frames, and an in-memory address -> offset map
//                built when the file is opened. This is what an integrator writes on a
//                device with no database: the record survives the power cut and an address
//                finds it without a scan.
//   sqlite       the standard embedded database, WAL journal, the address as a clustered
//                primary key. This is the general-purpose answer to the same workload.
//
// Both store the content the engine's own bench stores: three 60-byte addresses (fact,
// intent, hint), a 5-byte origin, a 10-byte media type, and a payload of the same shape.
// Storing less would make the peers look leaner than they are, so the record content is
// held identical and the differences that follow are the formats, not the workload.
//
// Every figure is the median of SAMPLES calls. Output is JSON on stdout.

#define _POSIX_C_SOURCE 200809L

#include <fcntl.h>
#include <sqlite3.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <time.h>
#include <unistd.h>
#ifdef __APPLE__
#include <mach/mach_time.h>
#endif

#define SAMPLES 51
#define ADDRESS 60
#define ORIGIN "bench"
#define ORIGIN_LEN 5
#define MEDIA "text/plain"
#define MEDIA_LEN 10
#define HEADER 8
#define RUNG_COUNT 5

// The build passes the host in, because a measurement that does not name its machine is not
// reproducible.
#ifndef HOST
#define HOST "unknown"
#endif

// A single volume stops at 4 GiB, which at 484 bytes a record is about 8.9M records. The top
// rung is the largest the engine's own bench can reserve under that limit.
static const unsigned long long rungs[RUNG_COUNT] = {1000ULL, 10000ULL, 100000ULL, 1000000ULL,
                                                     5000000ULL};

static void fail(const char *what) {
    fprintf(stderr, "bench: %s\n", what);
    exit(1);
}

// CLOCK_MONOTONIC ticks in microseconds on Darwin, which is coarser than every read here, so
// the timebase is read directly where it exists.
static double now_us(void) {
#ifdef __APPLE__
    static mach_timebase_info_data_t base;
    if (base.denom == 0) mach_timebase_info(&base);
    return (double)mach_absolute_time() * (double)base.numer / (double)base.denom / 1e3;
#else
    struct timespec ts;
    if (clock_gettime(CLOCK_MONOTONIC, &ts) != 0) fail("clock_gettime");
    return (double)ts.tv_sec * 1e6 + (double)ts.tv_nsec / 1e3;
#endif
}

static int cmp_double(const void *a, const void *b) {
    double x = *(const double *)a;
    double y = *(const double *)b;
    return (x > y) - (x < y);
}

static double median(double *v, size_t n) {
    qsort(v, n, sizeof(double), cmp_double);
    return v[n / 2];
}

// A fixed-width address, ordered the way it is written: the engine's address is twenty
// coordinates of three characters each, and this keeps the same width and the same ordering.
static void address(char out[ADDRESS + 1], unsigned long long index) {
    memset(out, '0', ADDRESS);
    out[ADDRESS] = '\0';
    unsigned long long v = index;
    for (int i = ADDRESS - 1; i >= 0 && v; i--) {
        out[i] = (char)('0' + (int)(v % 62));
        v /= 62;
    }
}

static size_t payload_of(char *out, size_t cap, unsigned long long index) {
    int n = snprintf(out, cap, "decision %llu: the arm moved and the reach was clear", index);
    if (n < 0 || (size_t)n >= cap) fail("payload");
    return (size_t)n;
}

static uint64_t fnv(const char *key) {
    uint64_t h = 1469598103934665603ULL;
    for (size_t i = 0; i < ADDRESS; i++) {
        h ^= (unsigned char)key[i];
        h *= 1099511628211ULL;
    }
    return h;
}

// ── append-log ───────────────────────────────────────────────────────────────

typedef struct {
    uint64_t hash;
    uint64_t offset_plus_one;
} Slot;

typedef struct {
    Slot *slots;
    size_t mask;
    size_t bytes;
} Map;

static void map_build(Map *map, const unsigned char *base, size_t len) {
    size_t size = 1;
    while (size < (len / 200 + 1) * 2) size <<= 1;
    map->slots = calloc(size, sizeof(Slot));
    if (!map->slots) fail("calloc");
    map->mask = size - 1;
    map->bytes = size * sizeof(Slot);

    size_t at = 0;
    while (at + HEADER <= len) {
        uint32_t record_len;
        memcpy(&record_len, base + at, sizeof record_len);
        if (record_len == 0) break;
        const char *key = (const char *)(base + at + HEADER);
        uint64_t hash = fnv(key);
        size_t slot = hash & map->mask;
        while (map->slots[slot].offset_plus_one) slot = (slot + 1) & map->mask;
        map->slots[slot].hash = hash;
        map->slots[slot].offset_plus_one = (uint64_t)at + 1;
        at += HEADER + record_len;
    }
}

static uint64_t map_find(const Map *map, const char *key) {
    uint64_t hash = fnv(key);
    size_t slot = hash & map->mask;
    while (map->slots[slot].offset_plus_one) {
        if (map->slots[slot].hash == hash) return map->slots[slot].offset_plus_one - 1;
        slot = (slot + 1) & map->mask;
    }
    return UINT64_MAX;
}

static size_t frame_build(unsigned char *frame, unsigned long long index, size_t *payload_len) {
    char fact[ADDRESS + 1], intent[ADDRESS + 1], hint[ADDRESS + 1], payload[128];
    address(fact, index);
    address(intent, index + 1);
    address(hint, index + 2);
    size_t plen = payload_of(payload, sizeof payload, index);

    uint32_t record_len = (uint32_t)(3 * ADDRESS + ORIGIN_LEN + MEDIA_LEN + plen);
    uint32_t pl32 = (uint32_t)plen;
    memcpy(frame, &record_len, sizeof record_len);
    memcpy(frame + 4, &pl32, sizeof pl32);
    memcpy(frame + HEADER, fact, ADDRESS);
    memcpy(frame + HEADER + ADDRESS, intent, ADDRESS);
    memcpy(frame + HEADER + 2 * ADDRESS, hint, ADDRESS);
    memcpy(frame + HEADER + 3 * ADDRESS, ORIGIN, ORIGIN_LEN);
    memcpy(frame + HEADER + 3 * ADDRESS + ORIGIN_LEN, MEDIA, MEDIA_LEN);
    memcpy(frame + HEADER + 3 * ADDRESS + ORIGIN_LEN + MEDIA_LEN, payload, plen);

    *payload_len = plen;
    return HEADER + (size_t)record_len;
}

typedef struct {
    unsigned long long records;
    unsigned long long volume_bytes;
    unsigned long long map_bytes;
    double open_us;
    double point_read_us;
    double range_us;
    unsigned long long range_answers;
    double write_us;
    unsigned long long write_bytes;
} LogResult;

static void measure_log(const char *dir, unsigned long long records, LogResult *out) {
    char path[512];
    snprintf(path, sizeof path, "%s/append-log-%llu.log", dir, records);
    unlink(path);

    int fd = open(path, O_RDWR | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) fail("open log");

    static unsigned char frame[HEADER + 3 * ADDRESS + ORIGIN_LEN + MEDIA_LEN + 128];
    for (unsigned long long i = 0; i < records; i++) {
        size_t payload_len;
        size_t len = frame_build(frame, i, &payload_len);
        if (write(fd, frame, len) != (ssize_t)len) fail("write log");
    }
    if (fsync(fd) != 0) fail("fsync log");

    struct stat st;
    if (fstat(fd, &st) != 0) fail("fstat");

    // An open is the map the file needs before an address answers, not a file descriptor.
    double opens[SAMPLES];
    for (size_t s = 0; s < SAMPLES; s++) {
        struct stat st;
        if (fstat(fd, &st) != 0) fail("fstat");
        size_t len = (size_t)st.st_size;
        void *base = mmap(NULL, len, PROT_READ, MAP_PRIVATE, fd, 0);
        if (base == MAP_FAILED) fail("mmap");

        double at = now_us();
        Map map;
        map_build(&map, base, len);
        opens[s] = now_us() - at;

        free(map.slots);
        munmap(base, len);
    }

    if (fstat(fd, &st) != 0) fail("fstat");
    size_t len = (size_t)st.st_size;
    unsigned long long volume_bytes = (unsigned long long)st.st_size;
    unsigned char *base = mmap(NULL, len, PROT_READ, MAP_PRIVATE, fd, 0);
    if (base == MAP_FAILED) fail("mmap");

    Map map;
    map_build(&map, base, len);

    char key[ADDRESS + 1];
    double reads[SAMPLES];
    for (size_t s = 0; s < SAMPLES; s++) {
        address(key, records / 2 + s % 16);
        double at = now_us();
        uint64_t offset = map_find(&map, key);
        if (offset == UINT64_MAX) fail("point read missed");
        if (memcmp(base + offset + HEADER, key, ADDRESS) != 0) fail("point read key");
        reads[s] = now_us() - at;
    }

    // A tenth of the addresses, selected by a contiguous range on them. The answer is the
    // addresses themselves, which is what the engine returns: counting them instead would
    // let a database answer from the index alone and measure a smaller job.
    char lo[ADDRESS + 1], hi[ADDRESS + 1];
    address(lo, records / 2);
    address(hi, records / 2 + records / 10);
    char *found = malloc((size_t)records * ADDRESS);
    if (!found) fail("malloc");
    double ranges[SAMPLES];
    unsigned long long answers = 0;
    for (size_t s = 0; s < SAMPLES; s++) {
        double at = now_us();
        unsigned long long n = 0;
        size_t at_byte = 0;
        while (at_byte + HEADER <= len) {
            uint32_t record_len;
            memcpy(&record_len, base + at_byte, sizeof record_len);
            if (record_len == 0) break;
            const char *fact = (const char *)(base + at_byte + HEADER);
            if (memcmp(fact, lo, ADDRESS) >= 0 && memcmp(fact, hi, ADDRESS) < 0) {
                memcpy(found + n * ADDRESS, fact, ADDRESS);
                n++;
            }
            at_byte += HEADER + record_len;
        }
        ranges[s] = now_us() - at;
        answers = n;
    }
    free(found);

    double writes[SAMPLES];
    unsigned long long write_bytes = 0;
    for (size_t s = 0; s < SAMPLES; s++) {
        size_t payload_len;
        size_t len_frame = frame_build(frame, records + s, &payload_len);
        double at = now_us();
        ssize_t wrote = write(fd, frame, len_frame);
        writes[s] = now_us() - at;
        if (wrote != (ssize_t)len_frame) fail("append");
        write_bytes = (unsigned long long)wrote;
    }

    out->records = records;
    out->volume_bytes = volume_bytes;
    out->map_bytes = map.bytes;
    out->open_us = median(opens, SAMPLES);
    out->point_read_us = median(reads, SAMPLES);
    out->range_us = median(ranges, SAMPLES);
    out->range_answers = answers;
    out->write_us = median(writes, SAMPLES);
    out->write_bytes = write_bytes;

    free(map.slots);
    munmap(base, len);
    close(fd);
}

// ── sqlite ───────────────────────────────────────────────────────────────────

static sqlite3 *db_open(const char *path) {
    sqlite3 *db = NULL;
    if (sqlite3_open(path, &db) != SQLITE_OK) fail(sqlite3_errmsg(db));
    const char *pragmas =
        "PRAGMA journal_mode=WAL;"
        "PRAGMA synchronous=NORMAL;"
        "PRAGMA cache_size=-8192;"
        "PRAGMA temp_store=MEMORY;";
    if (sqlite3_exec(db, pragmas, NULL, NULL, NULL) != SQLITE_OK) fail(sqlite3_errmsg(db));
    return db;
}

static void exec_ok(sqlite3 *db, const char *sql) {
    if (sqlite3_exec(db, sql, NULL, NULL, NULL) != SQLITE_OK) fail(sqlite3_errmsg(db));
}

typedef struct {
    unsigned long long records;
    unsigned long long volume_bytes;
    double open_us;
    double point_read_us;
    double range_us;
    unsigned long long range_answers;
    double write_us;
    unsigned long long write_bytes;
} DbResult;

// A statement that binds an index into one of the three address columns. The key is a stack
// buffer, so SQLite has to copy it: binding it static leaves two bounds pointing at one slot.
static void bind_address(sqlite3_stmt *stmt, int column, unsigned long long index) {
    char key[ADDRESS + 1];
    address(key, index);
    sqlite3_bind_text(stmt, column, key, ADDRESS, SQLITE_TRANSIENT);
}

static void measure_sqlite(const char *dir, unsigned long long records, DbResult *out) {
    char path[512];
    snprintf(path, sizeof path, "%s/sqlite-%llu.db", dir, records);
    unlink(path);

    char wal[560];
    snprintf(wal, sizeof wal, "%s-wal", path);
    unlink(wal);
    char shm[560];
    snprintf(shm, sizeof shm, "%s-shm", path);
    unlink(shm);

    sqlite3 *db = db_open(path);
    exec_ok(db,
            "CREATE TABLE records("
            "fact_key TEXT PRIMARY KEY,"
            "intent_key TEXT NOT NULL,"
            "hint_key TEXT NOT NULL,"
            "origin TEXT NOT NULL,"
            "media TEXT NOT NULL,"
            "payload TEXT NOT NULL"
            ") WITHOUT ROWID;");

    exec_ok(db, "BEGIN");
    sqlite3_stmt *insert = NULL;
    if (sqlite3_prepare_v2(db,
                           "INSERT INTO records VALUES(?1,?2,?3,?4,?5,?6)",
                           -1, &insert, NULL) != SQLITE_OK)
        fail(sqlite3_errmsg(db));

    char payload[128];
    for (unsigned long long i = 0; i < records; i++) {
        size_t plen = payload_of(payload, sizeof payload, i);
        sqlite3_reset(insert);
        bind_address(insert, 1, i);
        bind_address(insert, 2, i + 1);
        bind_address(insert, 3, i + 2);
        sqlite3_bind_text(insert, 4, ORIGIN, ORIGIN_LEN, SQLITE_STATIC);
        sqlite3_bind_text(insert, 5, MEDIA, MEDIA_LEN, SQLITE_STATIC);
        sqlite3_bind_text(insert, 6, payload, (int)plen, SQLITE_STATIC);
        if (sqlite3_step(insert) != SQLITE_DONE) fail(sqlite3_errmsg(db));
    }
    sqlite3_finalize(insert);
    exec_ok(db, "COMMIT");

    // The durable volume, not the write-ahead tail.
    exec_ok(db, "PRAGMA wal_checkpoint(TRUNCATE);");
    sqlite3_close(db);

    struct stat database, ahead;
    if (stat(path, &database) != 0) fail("stat");
    if (stat(wal, &ahead) != 0) fail("stat wal");
    unsigned long long volume_bytes = (unsigned long long)(database.st_size + ahead.st_size);

    // An open is the database ready to answer: the file, its pragmas, and its statements.
    double opens[SAMPLES];
    for (size_t s = 0; s < SAMPLES; s++) {
        double at = now_us();
        sqlite3 *one = db_open(path);
        sqlite3_stmt *stmt = NULL;
        if (sqlite3_prepare_v2(one, "SELECT payload FROM records WHERE fact_key=?1", -1, &stmt, NULL) !=
            SQLITE_OK)
            fail(sqlite3_errmsg(one));
        opens[s] = now_us() - at;
        sqlite3_finalize(stmt);
        sqlite3_close(one);
    }

    db = db_open(path);
    sqlite3_stmt *point = NULL;
    if (sqlite3_prepare_v2(db, "SELECT payload FROM records WHERE fact_key=?1", -1, &point, NULL) !=
        SQLITE_OK)
        fail(sqlite3_errmsg(db));

    double reads[SAMPLES];
    for (size_t s = 0; s < SAMPLES; s++) {
        double at = now_us();
        sqlite3_reset(point);
        bind_address(point, 1, records / 2 + s % 16);
        if (sqlite3_step(point) != SQLITE_ROW) fail("point read missed");
        (void)sqlite3_column_text(point, 0);
        reads[s] = now_us() - at;
    }
    sqlite3_finalize(point);

    sqlite3_stmt *range = NULL;
    if (sqlite3_prepare_v2(db,
                           "SELECT fact_key FROM records WHERE fact_key>=?1 AND fact_key<?2",
                           -1, &range, NULL) != SQLITE_OK)
        fail(sqlite3_errmsg(db));

    char *found = malloc((size_t)records * ADDRESS);
    if (!found) fail("malloc");
    double ranges[SAMPLES];
    unsigned long long answers = 0;
    for (size_t s = 0; s < SAMPLES; s++) {
        double at = now_us();
        sqlite3_reset(range);
        bind_address(range, 1, records / 2);
        bind_address(range, 2, records / 2 + records / 10);
        unsigned long long n = 0;
        int rc;
        while ((rc = sqlite3_step(range)) == SQLITE_ROW) {
            const unsigned char *text = sqlite3_column_text(range, 0);
            int bytes = sqlite3_column_bytes(range, 0);
            if (n < records) {
                memcpy(found + n * ADDRESS, text, (size_t)(bytes < ADDRESS ? bytes : ADDRESS));
            }
            n++;
        }
        if (rc != SQLITE_DONE) fail(sqlite3_errmsg(db));
        ranges[s] = now_us() - at;
        answers = n;
    }
    free(found);
    sqlite3_finalize(range);

    sqlite3_stmt *write = NULL;
    if (sqlite3_prepare_v2(db, "INSERT INTO records VALUES(?1,?2,?3,?4,?5,?6)", -1, &write, NULL) !=
        SQLITE_OK)
        fail(sqlite3_errmsg(db));

    double writes[SAMPLES];
    unsigned long long write_bytes = 0;
    for (size_t s = 0; s < SAMPLES; s++) {
        struct stat db_before, wal_before, db_after, wal_after;
        if (stat(path, &db_before) != 0) fail("stat");
        if (stat(wal, &wal_before) != 0) fail("stat wal");
        size_t plen = payload_of(payload, sizeof payload, records + s);

        double at = now_us();
        sqlite3_reset(write);
        bind_address(write, 1, records + s);
        bind_address(write, 2, records + s + 1);
        bind_address(write, 3, records + s + 2);
        sqlite3_bind_text(write, 4, ORIGIN, ORIGIN_LEN, SQLITE_STATIC);
        sqlite3_bind_text(write, 5, MEDIA, MEDIA_LEN, SQLITE_STATIC);
        sqlite3_bind_text(write, 6, payload, (int)plen, SQLITE_STATIC);
        if (sqlite3_step(write) != SQLITE_DONE) fail(sqlite3_errmsg(db));
        if (sqlite3_changes(db) != 1) fail("write count");
        writes[s] = now_us() - at;

        if (stat(path, &db_after) != 0) fail("stat");
        if (stat(wal, &wal_after) != 0) fail("stat wal");
        write_bytes = (unsigned long long)((db_after.st_size + wal_after.st_size) -
                                           (db_before.st_size + wal_before.st_size));
    }
    sqlite3_finalize(write);
    sqlite3_close(db);

    out->records = records;
    out->volume_bytes = volume_bytes;
    out->open_us = median(opens, SAMPLES);
    out->point_read_us = median(reads, SAMPLES);
    out->range_us = median(ranges, SAMPLES);
    out->range_answers = answers;
    out->write_us = median(writes, SAMPLES);
    out->write_bytes = write_bytes;
}

int main(int argc, char **argv) {
    const char *dir = argc > 1 ? argv[1] : "/tmp/ktema-bench";
    mkdir(dir, 0755);

    LogResult logs[RUNG_COUNT];
    DbResult dbs[RUNG_COUNT];
    for (size_t r = 0; r < RUNG_COUNT; r++) {
        measure_log(dir, rungs[r], &logs[r]);
        measure_sqlite(dir, rungs[r], &dbs[r]);
    }

    printf("{\n");
    printf("  \"host\": \"%s\",\n", HOST);
    printf("  \"sqlite\": \"%s\",\n", sqlite3_libversion());
    printf("  \"samples\": %d,\n", SAMPLES);
    printf("  \"units\": { \"time\": \"microseconds\", \"medium\": \"bytes\" },\n");

    printf("  \"append_log\": [\n");
    for (size_t r = 0; r < RUNG_COUNT; r++) {
        printf(
            "    { \"records\": %llu, \"volume_bytes\": %llu, \"map_bytes\": %llu, "
            "\"open_us\": %.3f, \"point_read_us\": %.3f, \"range_us\": %.3f, "
            "\"range_answers\": %llu, \"write_us\": %.3f, \"write_bytes\": %llu }%s\n",
            logs[r].records, logs[r].volume_bytes, logs[r].map_bytes, logs[r].open_us,
            logs[r].point_read_us, logs[r].range_us, logs[r].range_answers, logs[r].write_us,
            logs[r].write_bytes, r + 1 < RUNG_COUNT ? "," : "");
    }
    printf("  ],\n");

    printf("  \"sqlite_rows\": [\n");
    for (size_t r = 0; r < RUNG_COUNT; r++) {
        printf(
            "    { \"records\": %llu, \"volume_bytes\": %llu, \"open_us\": %.3f, "
            "\"point_read_us\": %.3f, \"range_us\": %.3f, \"range_answers\": %llu, "
            "\"write_us\": %.3f, \"write_bytes\": %llu }%s\n",
            dbs[r].records, dbs[r].volume_bytes, dbs[r].open_us, dbs[r].point_read_us,
            dbs[r].range_us, dbs[r].range_answers, dbs[r].write_us, dbs[r].write_bytes,
            r + 1 < RUNG_COUNT ? "," : "");
    }
    printf("  ]\n}\n");
    return 0;
}

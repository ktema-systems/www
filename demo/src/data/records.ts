// The corpus as the center reads it: the record a subject is evidence of.
//
// A page cites a key rather than restating a run, so this is the one place a subject is resolved to the record the
// volume holds. The newest record wins, because a later run on the same subject is the current one and the earlier
// ones stay in the volume as history.
import corpus from './corpus.json';

export interface RecordEntry {
  key: string;
  activity: string;
  subject: string;
  claim: string;
  revision: string;
  created: string;
  /** What the record states beside its claim: a plan, where `planned` is true. */
  ext?: { planned?: boolean };
}

const records = (corpus.records ?? []) as RecordEntry[];

/** The newest record for a subject, where the corpus holds one. */
export function recordOf(subject: string): RecordEntry | undefined {
  let latest: RecordEntry | undefined;
  for (const record of records) {
    if (record.subject !== subject) continue;
    if (!latest || record.created > latest.created) latest = record;
  }
  return latest;
}


export type DocumentId = string;
type Reference = Array<string | number>;

export type NormalizedValue<
  TNormalizedType,
  TOriginalType = string
> = {
  normalized?: TNormalizedType | undefined;
  original: TOriginalType;
}

export type InboxTrack = {
  _id: string
  trackId: string
  source: string
  title: NormalizedValue<string>
  author: NormalizedValue<DocumentId>
  location: NormalizedValue<DocumentId>
  references: NormalizedValue<Reference>[]
  date: NormalizedValue<number[]>
  status: "ready" | "processing" | "error"
}

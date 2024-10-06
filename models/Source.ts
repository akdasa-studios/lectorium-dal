export type SourceProps = {
  _id: string
  name: LocalizedSourceNames
}

export type LocalizedSourceNames = Record<string, SourceName>

export type SourceName = {
  full: string
  short: string
}


export type Reference = string[]

export class Source {
  constructor(
    public props: SourceProps
  ) {}

  /**
   * Getter for the `_id` property.
   *
   * @returns The unique identifier of the source.
   */
  get _id(): string { return this.props._id }

  /**
   * Retrieves the name of the source based on the specified language and type.
   * If the name is not available in the specified language, it falls back to
   * the first available language. If the name is still not found, it returns
   * "<No Name>".
   *
   * @param lang The language code to retrieve the name for.
   * @param type The type of the name to retrieve:
   *        short or full.
   * @returns The name of the source in the specified language and type,
   *          or a fallback value.
   */
  getName(
    lang: string,
    type: keyof SourceName
  ): string {
    const fallbackLanguage = Object.keys(this.props.name)[0]
    return (
      this.props.name[lang]?.[type] ||
      this.props.name[fallbackLanguage][type] ||
      "<No Name>"
    )
  }
}
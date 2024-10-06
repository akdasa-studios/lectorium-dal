export type LocationProps = {
  _id: string
  name: Record<string, string>
}

export class Location {
  constructor(public props: LocationProps) {}

  get _id() { return this.props._id }

  /**
   * Retrieves the name of the source based on the specified language and type.
   * If the name is not available in the specified language, it falls back to
   * the first available language. If the name is still not found, it returns
   * "<No Name>".
   *
   * @param {string} lang The language code to retrieve the name for.
   * @param {keyof SourceName} type The type of the name to retrieve:
   *        short or full.
   * @returns The name of the source in the specified language and type,
   *          or a fallback value.
   */
  getName(
    lang: string,
  ): string {
    const fallbackLanguage = Object.keys(this.props.name)[0]
    return (
      this.props.name[lang] ||
      this.props.name[fallbackLanguage] ||
      "<No Name>"
    )
  }
}

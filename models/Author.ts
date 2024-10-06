export type AuthorName = {
  full: string
  short: string
}

export type LocalizedAuthorName = Record<string, AuthorName>

export type AuthorProps = {
  _id: string
  name: LocalizedAuthorName
}


export class Author {
  constructor(public props: AuthorProps) {}

  get _id() { return this.props._id }

  /**
   * Retrieves the name of the author based on the specified language and type.
   * If the name is not available in the specified language, it falls back to
   * the first available language. If the name is still not found, it returns
   * "<No Name>".
   *
   * @param {string} lang The language code to retrieve the name for.
   * @param {keyof AuthorName} type The type of the name to retrieve:
   *        short or full.
   * @returns The name of the source in the specified language and type,
   *          or a fallback value.
   */
  getName(
    lang: string,
    type: keyof AuthorName
  ): string {
    const fallbackLanguage = Object.keys(this.props.name)[0]
    return (
      this.props.name[lang]?.[type] ||
      this.props.name[fallbackLanguage][type] ||
      "<No Name>"
    )
  }
}

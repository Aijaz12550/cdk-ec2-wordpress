
export const replaceAllSubstrings = (
    wordsArray: Array<Record<string, string>>,
    text: string
  ) =>
    wordsArray.reduce(
      (f, s) =>
        `${f}`.replace(new RegExp(Object.keys(s)[0], 'g'), s[Object.keys(s)[0]]),
      text
    )
// https://www.w3.org/International/questions/qa-escapes#use
const escapeRegExp = /["&'<>]/

// credits to https://github.com/component/escape-html
export default function escapeHtml(value: string | number) {
  const str = '' + value
  if (typeof value === 'number') {
    // better performance for safe values
    return str
  }

  const match = escapeRegExp.exec(str)
  if (!match) {
    return str
  }

  let { index } = match
  let lastIndex = 0
  let out = ''

  for (let escape = ''; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;'
        break
      case 38: // &
        escape = '&amp;'
        break
      case 39: // '
        escape = '&#39;' // shorter than "&apos;" and "&#x27;" plus supports HTML4
        break
      case 60: // <
        escape = '&lt;'
        break
      case 62: // >
        escape = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      out += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    out += escape
  }

  return lastIndex !== index ? out + str.substring(lastIndex, index) : out
}

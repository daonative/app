export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const isFirestoreDate = (date) => {
  if (typeof date?.toDate == 'function') {
    return true;
  }
  return false;
};

export function formatDate(datetime) {
  const date = new Date(datetime)
  const utcString = date.toISOString().substring(0, 19)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const localDatetime =
    year +
    '-' +
    (month < 10 ? '0' + month.toString() : month) +
    '-' +
    (day < 10 ? '0' + day.toString() : day) +
    'T' +
    (hour < 10 ? '0' + hour.toString() : hour) +
    ':' +
    (minute < 10 ? '0' + minute.toString() : minute) +
    utcString.substring(16, 19)

  return localDatetime
}


export const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
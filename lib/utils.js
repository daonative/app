export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const isFirestoreDate = (date) => {
  if (typeof date?.toDate == 'function') {
    return true;
  }
  return false;
};

/** FormData(form) omits the submit button, losing save/publish/archive intent. */
export function submittedForm(form: HTMLFormElement, event: Event) {
  return new FormData(form, event instanceof SubmitEvent ? event.submitter : null);
}

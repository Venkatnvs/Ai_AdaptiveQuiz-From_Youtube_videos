const formatErrorMessages = (error) => {
  if (!error) return <p>Unknown error occurred</p>;

  if (typeof error === 'string') return <p>{error}</p>;

  if (error.non_field_errors) {
    return error.non_field_errors.map((msg, i) => <p key={i}>{msg}</p>);
  }

  if (error.errors) {
    return Object.entries(error.errors).map(([field, messages], i) => (
      <p key={i}>
        <strong className="capitalize">{field}:</strong> {messages.join(', ')}
      </p>
    ));
  }

  return <p>Unknown error occurred</p>;
}


export default formatErrorMessages;
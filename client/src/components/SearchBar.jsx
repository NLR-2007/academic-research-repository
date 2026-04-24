export default function SearchBar({ value, onChange }) {
  return (
    <label className="search">
      <span>Search the repository</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title, author, abstract, or keyword..."
      />
    </label>
  );
}

import clsx from 'clsx';
import { useCallback, useState } from 'react';

/**
 * @typedef {Object} SearchBarProps
 * @prop {string} [className]
 * @prop {React.ReactNode} [icon]
 * @prop {string} [value]
 * @prop {string} [placeholder]
 * @prop {function} [onChange]
 */

/**
 *
 * @param {SearchBarProps} props
 */
const SearchBar = ({ className, icon, value, placeholder, onChange }) => {
  const [focused, setFocused] = useState(false);

  const onInputFocus = useCallback(() => setFocused(true), [setFocused]);
  const onInputBlur = useCallback(() => setFocused(false), [setFocused]);

  // useEffect(() => value !== "" && onChange?.(value), [onChange, value])

  return (
    <div className={clsx(className, 'SearchBar', { focused })}>
      {icon && <div className="search-icon">{icon}</div>}

      <input
        className="search-input"
        defaultValue={value}
        placeholder={placeholder}
        type="text"
        onChange={event => onChange?.(event.target.value)}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
      />
    </div>
  );
};

SearchBar.defaultProps = {
  placeholder: '',
  value: '',
};

export default SearchBar;

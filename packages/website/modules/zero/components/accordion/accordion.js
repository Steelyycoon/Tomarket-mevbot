import React, { useState, useRef } from 'react';

/**
 * @param {object} props
 * @param {boolean} props.multiple
 * @param {boolean} props.toggleOnLoad
 * @param {boolean} props.toggleAllOption
 * @param {any} props.children
 */

function Accordion({ multiple, toggleOnLoad, toggleAllOption, children }) {
  const [active, setActive] = useState(/** @type {string[]} */ ([]));
  const [expanded, setExpanded] = useState(false);
  const sections = useRef(/** @type {string[]} */ ([]));
  const buttonMessage = expanded ? 'collapse all' : 'expand all';

  const setActiveSections = id => {
    if (multiple) {
      if (active.includes(id)) {
        setActive(active.filter(_id => _id !== id));
      } else {
        setActive([...active, id]);
      }
    } else {
      if (active[0] === id) {
        setActive([]);
      } else {
        setActive([id]);
      }
    }
  };

  const reportUID = id => {
    sections.current.push(id);
  };

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        active: active,
        toggle: setActiveSections,
        toggleOnLoad: toggleOnLoad,
        reportUID: reportUID,
      });
    }
    return child;
  });

  const toggleExpanded = () => {
    if (expanded) {
      setActive([]);
    } else {
      setActive(sections.current);
    }

    setExpanded(!expanded);
  };

  return (
    <>
      {toggleAllOption && (
        <div className="accordion-control-bar">
          <button className="accordion-expand-all-toggle" onClick={toggleExpanded}>
            {buttonMessage}
          </button>
        </div>
      )}

      <div className="accordion">{childrenWithProps}</div>
    </>
  );
}

Accordion.defaultProps = {
  multiple: false,
};

export default Accordion;

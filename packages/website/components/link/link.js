import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const WrappedLink = ({ tabIndex = 0, href, target = '_self', ...otherProps }) => (
  <Link href={href} {...otherProps}>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
    <a target={target} {...otherProps} tabIndex={tabIndex} onClick={otherProps.onClick}>
      {otherProps.children}
    </a>
  </Link>
);

WrappedLink.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string]),
  href: PropTypes.string.isRequired,
  target: PropTypes.string,
};

export default WrappedLink;

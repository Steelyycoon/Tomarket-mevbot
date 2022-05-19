import clsx from 'clsx';
import InfoAIcon from 'assets/icons/infoA';

/**
 * @typedef {Object} InfoProps
 * @property {string} content
 * @property {string} [position]
 * @property {React.ReactNode} [icon]
 * @prop {string} [className]
 */

/**
 *
 * @param {InfoProps} props
 * @returns
 */
const Tooltip = ({ content, icon = null, className, position }) => {
  return (
    <div role="tooltip" className={clsx(className, 'Tooltip', position)}>
      {icon || <InfoAIcon />}
      <span className="tooltip-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Tooltip;

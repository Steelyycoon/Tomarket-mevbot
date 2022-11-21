declare module 'countly-sdk-web';

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface Window {
  sa_event: (...args: any[]) => void
}

declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.gif';
declare module '*.svg' {
  const content: string;
  export default content;
}
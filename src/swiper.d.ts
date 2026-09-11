// Side-effect CSS imports from Swiper have no bundled type declarations.
// Declare them as modules so TS strict stops complaining; Vite still loads
// the styles at runtime because of the `?url`/side-effect contract.
declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';
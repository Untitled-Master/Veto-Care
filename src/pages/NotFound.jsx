import { Link } from 'react-router-dom';

export default function NotFound({ c }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center mt-24">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
        404 - Not Found
      </h1>
      <p className={`${c.textMuted} text-lg mb-10 leading-relaxed max-w-xl`}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/" 
        className={`${c.accent} ${c.accentText} px-6 py-3 rounded-sm font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity`}
      >
        Return Home
      </Link>
    </div>
  );
}

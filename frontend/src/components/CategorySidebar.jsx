export default function CategorySidebar({ categories = [], activeCategory, onSelectCategory }) {
  const icons = {
    All: '🍽️',
    Food: '🍔',
    Drinks: '🥤',
    Beverage: '☕',
    Pastry: '🥐',
    Snack: '🍪',
  };

  const allCategories = ['All', ...categories];

  return (
    <div className="w-52 flex-shrink-0">
      <p className="text-xs uppercase tracking-widest text-[#9a9a7a] font-semibold mb-4 px-1">
        Categories
      </p>

      <div className="flex flex-col gap-1">
        {allCategories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory?.(cat)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 ${
                isActive
                  ? 'bg-[#1e3a1e] text-white shadow-md scale-[1.02]'
                  : 'bg-transparent text-[#3a3a2a] hover:bg-[#e8e4d8]'
              }`}
            >
              <span className="text-base">{icons[cat] || '🍴'}</span>
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
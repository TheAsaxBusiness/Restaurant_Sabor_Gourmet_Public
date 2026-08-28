class MenuView {
  constructor() {
    this.categoriesContainer = null;
    this.dishesContainer = null;
  }

  init() {
    this.categoriesContainer = document.getElementById('categories');
    this.dishesContainer = document.getElementById('dishes');
  }

  renderCategories(categories, activeCategory, onSelectCategory) {
    this.categoriesContainer.innerHTML = '';

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.display = 'flex';
    ul.style.gap = '10px';
    ul.style.flexWrap = 'wrap';

    categories.forEach(categoria => {
      const li = document.createElement('li');
      li.textContent = categoria;
      li.style.padding = '8px 16px';
      li.style.cursor = 'pointer';
      li.style.borderRadius = '4px';
      li.style.transition = 'all 0.2s';

      if (categoria === activeCategory) {
        li.style.backgroundColor = '#ff6b35';
        li.style.color = 'white';
      } else {
        li.style.backgroundColor = '#f0f0f0';
      }

      li.addEventListener('click', () => onSelectCategory(categoria));
      ul.appendChild(li);
    });

    this.categoriesContainer.appendChild(ul);
  }

  renderDishes(dishes, onAddToCart, onViewDetails) {
    this.dishesContainer.innerHTML = '';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    grid.style.gap = '20px';

    dishes.forEach(plato => {
      const card = document.createElement('div');
      card.style.border = '1px solid #ddd';
      card.style.borderRadius = '8px';
      card.style.overflow = 'hidden';
      card.style.backgroundColor = 'white';
      card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

      const img = document.createElement('img');
      img.src = plato.image;
      img.alt = plato.name;
      img.style.width = '100%';
      img.style.height = '150px';
      img.style.objectFit = 'cover';
      card.appendChild(img);

      const nombre = document.createElement('h3');
      nombre.textContent = plato.name;
      nombre.style.margin = '10px';
      nombre.style.fontSize = '18px';
      card.appendChild(nombre);

      const desc = document.createElement('p');
      desc.textContent = plato.description;
      desc.style.margin = '0 10px 10px';
      desc.style.fontSize = '14px';
      desc.style.color = '#666';
      card.appendChild(desc);

      const precio = document.createElement('p');
      precio.textContent = `$${plato.price.toFixed(2)}`;
      precio.style.margin = '0 10px 10px';
      precio.style.fontWeight = 'bold';
      precio.style.fontSize = '16px';
      precio.style.color = '#d35400';
      card.appendChild(precio);

      const btnAgregar = document.createElement('button');
      btnAgregar.textContent = 'Agregar al Carrito';
      btnAgregar.style.margin = '0 10px 10px';
      btnAgregar.style.padding = '8px 12px';
      btnAgregar.style.backgroundColor = '#ff6b35';
      btnAgregar.style.color = 'white';
      btnAgregar.style.border = 'none';
      btnAgregar.style.borderRadius = '4px';
      btnAgregar.style.cursor = 'pointer';
      btnAgregar.addEventListener('click', () => onAddToCart(plato));
      card.appendChild(btnAgregar);

      grid.appendChild(card);
    });

    this.dishesContainer.appendChild(grid);
  }

  renderIngredientList(ingredients) {
    const lista = document.createElement('ul');
    lista.style.paddingLeft = '20px';

    ingredients.forEach(ingrediente => {
      const item = document.createElement('li');
      item.textContent = ingrediente;
      lista.appendChild(item);
    });

    return lista;
  }

  renderDishDetailModal(dish) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const contenido = document.createElement('div');
    contenido.style.backgroundColor = 'white';
    contenido.style.padding = '20px';
    contenido.style.borderRadius = '8px';
    contenido.style.maxWidth = '500px';
    contenido.style.width = '90%';

    const titulo = document.createElement('h2');
    titulo.textContent = dish.name;
    contenido.appendChild(titulo);

    const subtitulo = document.createElement('h4');
    subtitulo.textContent = 'Ingredientes:';
    contenido.appendChild(subtitulo);
    contenido.appendChild(this.renderIngredientList(dish.ingredients));

    if (dish.videoUrl) {
      const subtituloVideo = document.createElement('h4');
      subtituloVideo.textContent = 'Preparación:';
      contenido.appendChild(subtituloVideo);

      const video = document.createElement('video');
      video.src = dish.videoUrl;
      video.controls = true;
      video.style.width = '100%';
      video.style.marginTop = '10px';
      contenido.appendChild(video);
    }

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.style.marginTop = '15px';
    btnCerrar.style.padding = '8px 16px';
    btnCerrar.style.backgroundColor = '#ccc';
    btnCerrar.style.border = 'none';
    btnCerrar.style.borderRadius = '4px';
    btnCerrar.style.cursor = 'pointer';
    btnCerrar.addEventListener('click', () => modal.remove());
    contenido.appendChild(btnCerrar);

    modal.appendChild(contenido);
    document.body.appendChild(modal);
  }
}
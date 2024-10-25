const clientID = '06e111fc44f745d981f0d40b7cd6362b';
const redirectURI = 'https://globify-qh8k.vercel.app';
let token = localStorage.getItem('spotifyToken');

function authenticateSpotify() {
  const url = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectURI}&scope=user-read-private user-read-email playlist-read-private user-library-read`;
  window.location.href = url;
}

function getTokenFromUrl() {
  const hash = window.location.hash.substring(1); 
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

function handleRedirect() {
  token = getTokenFromUrl();
  if (token) {
    localStorage.setItem('spotifyToken', token);
    window.location.hash = '';

    console.log("Token obtenido y almacenado:", token);

    displayUserProfile();
    loadPlaylists();
  } else {
    console.log("No se encontró el token en la URL.");
  }
}

function logout() {
  localStorage.removeItem('spotifyToken');
  token = null;
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('playlist-section').innerHTML = '';
  document.getElementById('profile-section').innerHTML = '';
}

async function displayUserProfile() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil del usuario');
    }

    const userData = await response.json();
    console.log("Datos del usuario:", userData);

    const profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = `
      <h2>Bienvenido, ${userData.display_name}</h2>
      <div>
      
      <img src="${userData.images[0]?.url}" alt="Foto de perfil" width="100">
      </div>
      </div>
    `;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
  }
}

async function loadPlaylists() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al obtener las listas de reproducción');
    }

    const playlists = await response.json();
    console.log("Listas de reproducción:", playlists); // Debug: Verificar las listas de reproducción

    const playlistSection = document.getElementById('playlist-section');
    playlistSection.innerHTML = ``;

    playlists.items.forEach((playlist, index) => {
      const playlistDiv = document.createElement('div');
      playlistDiv.id = `list${index + 1}`;
      playlistDiv.innerHTML = `
        <img src="${playlist.images[0]?.url}">
        <h4>${index + 1} | ${playlist.name}</h4>
      `;
      playlistSection.appendChild(playlistDiv);
      playlistDiv.addEventListener('click', function() {
        console.log(`${playlist.name} was clicked!`);
      });
    });
  } catch (error) {
    console.error("Error al cargar las listas de reproducción:", error);
  }
}


document.getElementById('loginBtn').addEventListener('click', authenticateSpotify);
document.getElementById('logoutBtn').addEventListener('click', logout);

window.addEventListener('load', () => {
  if (window.location.hash) {
    handleRedirect();
  } else if (token) {
    displayUserProfile();
    loadPlaylists();
  }
});


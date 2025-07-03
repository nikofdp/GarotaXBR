// Configurações da API
const API_BASE_URL = '/api';

// Estado global da aplicação
let estados = [];
let cidades = [];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar modal de verificação de idade
    showAgeVerificationModal();
    
    // Carregar dados iniciais
    loadEstados();
    loadCidadesPorRegiao();
    
    // Event listeners
    setupEventListeners();
});

// Modal de verificação de idade
function showAgeVerificationModal() {
    const modal = new bootstrap.Modal(document.getElementById('ageVerificationModal'));
    modal.show();
    
    document.getElementById('acceptBtn').addEventListener('click', function() {
        modal.hide();
        localStorage.setItem('ageVerified', 'true');
    });
    
    document.getElementById('denyBtn').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Botões de vídeos
    document.getElementById('videosRecentesBtn').addEventListener('click', function() {
        alert('Funcionalidade de vídeos em desenvolvimento');
    });
    
    document.getElementById('videosMaisVistosBtn').addEventListener('click', function() {
        alert('Funcionalidade de vídeos em desenvolvimento');
    });
}

// Carregar estados para o dropdown
async function loadEstados() {
    try {
        const response = await fetch(`${API_BASE_URL}/estados`);
        if (!response.ok) throw new Error('Erro ao carregar estados');
        
        estados = await response.json();
        populateEstadosDropdown();
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        showError('Erro ao carregar estados');
    }
}

// Popular dropdown de estados
function populateEstadosDropdown() {
    const estadosList = document.getElementById('estadosList');
    estadosList.innerHTML = '';
    
    // Agrupar estados por região
    const regioes = {};
    estados.forEach(estado => {
        if (!regioes[estado.regiao]) {
            regioes[estado.regiao] = [];
        }
        regioes[estado.regiao].push(estado);
    });
    
    // Criar itens do dropdown agrupados por região
    Object.keys(regioes).forEach(regiao => {
        // Header da região
        const regiaoHeader = document.createElement('li');
        regiaoHeader.innerHTML = `<h6 class="dropdown-header text-pink">${regiao}</h6>`;
        estadosList.appendChild(regiaoHeader);
        
        // Estados da região
        regioes[regiao].forEach(estado => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a class="dropdown-item" href="#regiao-${regiao.toLowerCase().replace(/\s+/g, '-')}" 
                   onclick="scrollToRegiao('${regiao}')">
                    ${estado.nome} (${estado.total_cidades} cidades)
                </a>
            `;
            estadosList.appendChild(li);
        });
        
        // Divisor
        if (Object.keys(regioes).indexOf(regiao) < Object.keys(regioes).length - 1) {
            const divider = document.createElement('li');
            divider.innerHTML = '<hr class="dropdown-divider">';
            estadosList.appendChild(divider);
        }
    });
}

// Scroll suave para região
function scrollToRegiao(regiao) {
    const regiaoId = `regiao-${regiao.toLowerCase().replace(/\s+/g, '-')}`;
    const elemento = document.getElementById(regiaoId);
    if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth' });
    }
}

// Carregar cidades por região
async function loadCidadesPorRegiao() {
    try {
        const response = await fetch(`${API_BASE_URL}/cidades`);
        if (!response.ok) throw new Error('Erro ao carregar cidades');
        
        cidades = await response.json();
        populateCidadesPorEstado();
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        showError('Erro ao carregar cidades');
    }
}

// Popular cidades por estado
function populateCidadesPorEstado() {
    // Mapear siglas dos estados para IDs dos containers
    const estadoContainers = {
        'SP': 'cidades-sp',
        'RJ': 'cidades-rj',
        'MG': 'cidades-mg',
        'ES': 'cidades-es',
        'PR': 'cidades-pr',
        'SC': 'cidades-sc',
        'RS': 'cidades-rs',
        'DF': 'cidades-df',
        'GO': 'cidades-go',
        'MT': 'cidades-mt'
    };
    
    // Agrupar cidades por estado
    const cidadesPorEstado = {};
    cidades.forEach(cidade => {
        const estadoNome = cidade.estado_nome;
        const estado = estados.find(e => e.nome === estadoNome);
        if (estado) {
            const sigla = estado.sigla;
            if (!cidadesPorEstado[sigla]) {
                cidadesPorEstado[sigla] = [];
            }
            cidadesPorEstado[sigla].push(cidade);
        }
    });
    
    // Popular containers de cidades
    Object.keys(estadoContainers).forEach(sigla => {
        const container = document.getElementById(estadoContainers[sigla]);
        if (container && cidadesPorEstado[sigla]) {
            container.innerHTML = '';
            
            // Mostrar apenas as primeiras 6 cidades
            const cidadesParaMostrar = cidadesPorEstado[sigla].slice(0, 6);
            
            cidadesParaMostrar.forEach(cidade => {
                const cidadeCard = createCidadeCard(cidade);
                container.appendChild(cidadeCard);
            });
            
            // Botão "Ver Todas" se houver mais cidades
            if (cidadesPorEstado[sigla].length > 6) {
                const verTodasBtn = createVerTodasButton(sigla, cidadesPorEstado[sigla].length);
                const colDiv = document.createElement('div');
                colDiv.className = 'col-12 text-center';
                colDiv.appendChild(verTodasBtn);
                container.appendChild(colDiv);
            }
        }
    });
}

// Criar card de cidade
function createCidadeCard(cidade) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 col-sm-12';
    
    col.innerHTML = `
        <div class="cidade-card" onclick="goToCidade(${cidade.id})">
            <h5>${cidade.nome}</h5>
            <span class="badge">${cidade.total_acompanhantes} acompanhantes</span>
        </div>
    `;
    
    return col;
}

// Criar botão "Ver Todas"
function createVerTodasButton(sigla, totalCidades) {
    const button = document.createElement('button');
    button.className = 'btn ver-todas-btn';
    button.innerHTML = `Ver Todas as Cidades do Estado de ${sigla} (${totalCidades})`;
    button.onclick = () => showAllCidades(sigla);
    return button;
}

// Navegar para página da cidade
function goToCidade(cidadeId) {
    window.location.href = `/cidade/${cidadeId}`;
}

// Mostrar todas as cidades de um estado
function showAllCidades(sigla) {
    alert(`Funcionalidade para mostrar todas as cidades de ${sigla} em desenvolvimento`);
}

// Mostrar erro
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Função para busca (será implementada posteriormente)
function search(query) {
    console.log('Buscando por:', query);
    // Implementar busca
}

// Verificar se o usuário já verificou a idade
function checkAgeVerification() {
    return localStorage.getItem('ageVerified') === 'true';
}

// Função para criar logo placeholder
function createLogoPlaceholder() {
    // Se não houver logo, criar um placeholder
    const logoImg = document.querySelector('.navbar-brand img');
    if (logoImg && !logoImg.complete) {
        logoImg.onerror = function() {
            this.style.display = 'none';
            const logoText = document.createElement('span');
            logoText.textContent = 'GarotaXBR';
            logoText.style.fontSize = '1.5rem';
            logoText.style.fontWeight = 'bold';
            logoText.style.color = '#e91e63';
            this.parentNode.appendChild(logoText);
        };
    }
}

// Chamar função para criar logo placeholder
createLogoPlaceholder();


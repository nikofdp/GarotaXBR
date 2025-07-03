// Admin Panel JavaScript
const API_BASE_URL = '/api';
let isLoggedIn = false;
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupEventListeners();
});

// Verificar status de login
function checkLoginStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Verificar se o token é válido
        validateToken(token);
    } else {
        showLoginModal();
    }
}

// Mostrar modal de login
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

// Configurar event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });
}

// Manipular login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Simular autenticação (em produção, isso seria uma chamada real para a API)
        if (username === 'admin' && password === 'admin123') {
            const token = 'fake-jwt-token-' + Date.now();
            localStorage.setItem('adminToken', token);
            currentUser = { username: username };
            
            hideLoginModal();
            showAdminInterface();
            loadDashboardData();
        } else {
            showAlert('Usuário ou senha inválidos!', 'danger');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('Erro ao fazer login. Tente novamente.', 'danger');
    }
}

// Validar token
function validateToken(token) {
    // Em produção, isso seria uma chamada para a API
    if (token.startsWith('fake-jwt-token-')) {
        currentUser = { username: 'admin' };
        showAdminInterface();
        loadDashboardData();
    } else {
        localStorage.removeItem('adminToken');
        showLoginModal();
    }
}

// Esconder modal de login
function hideLoginModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) {
        modal.hide();
    }
}

// Mostrar interface de administração
function showAdminInterface() {
    document.getElementById('adminInterface').style.display = 'block';
    document.getElementById('adminUsername').textContent = currentUser.username;
    isLoggedIn = true;
}

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        // Carregar estatísticas
        const [acompanhantes, estados, cidades] = await Promise.all([
            fetch(`${API_BASE_URL}/acompanhantes`).then(r => r.json()),
            fetch(`${API_BASE_URL}/estados`).then(r => r.json()),
            fetch(`${API_BASE_URL}/cidades`).then(r => r.json())
        ]);
        
        // Atualizar contadores
        document.getElementById('totalAcompanhantes').textContent = acompanhantes.length;
        document.getElementById('totalEstados').textContent = estados.length;
        document.getElementById('totalCidades').textContent = cidades.length;
        document.getElementById('totalFotos').textContent = '0'; // Placeholder
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showAlert('Erro ao carregar dados do dashboard', 'warning');
    }
}

// Mostrar seção específica
function showSection(sectionName) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Remover classe active de todos os links
    const links = document.querySelectorAll('.sidebar ul li');
    links.forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    }
    
    // Adicionar classe active ao link clicado
    const activeLink = document.querySelector(`a[href="#${sectionName}"]`).parentElement;
    activeLink.classList.add('active');
    
    // Carregar dados específicos da seção
    switch(sectionName) {
        case 'acompanhantes':
            loadAcompanhantes();
            break;
        case 'estados':
            loadEstados();
            break;
        case 'cidades':
            loadCidades();
            break;
    }
}

// Carregar acompanhantes
async function loadAcompanhantes() {
    try {
        const response = await fetch(`${API_BASE_URL}/acompanhantes`);
        const acompanhantes = await response.json();
        
        const tbody = document.getElementById('acompanhantesTableBody');
        tbody.innerHTML = '';
        
        acompanhantes.forEach(acompanhante => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${acompanhante.id}</td>
                <td>${acompanhante.nome}</td>
                <td>${acompanhante.idade}</td>
                <td>${acompanhante.cidade.nome}</td>
                <td>${acompanhante.telefone || 'N/A'}</td>
                <td>
                    <span class="badge ${acompanhante.verificada ? 'badge-success' : 'badge-warning'}">
                        ${acompanhante.verificada ? 'Verificada' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editAcompanhante(${acompanhante.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAcompanhante(${acompanhante.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao carregar acompanhantes:', error);
        showAlert('Erro ao carregar acompanhantes', 'danger');
    }
}

// Carregar estados
async function loadEstados() {
    try {
        const response = await fetch(`${API_BASE_URL}/estados`);
        const estados = await response.json();
        
        const tbody = document.getElementById('estadosTableBody');
        tbody.innerHTML = '';
        
        estados.forEach(estado => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${estado.id}</td>
                <td>${estado.nome}</td>
                <td>${estado.sigla}</td>
                <td>${estado.regiao}</td>
                <td>${estado.total_cidades}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editEstado(${estado.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEstado(${estado.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        showAlert('Erro ao carregar estados', 'danger');
    }
}

// Carregar cidades
async function loadCidades() {
    try {
        const response = await fetch(`${API_BASE_URL}/cidades`);
        const cidades = await response.json();
        
        const tbody = document.getElementById('cidadesTableBody');
        tbody.innerHTML = '';
        
        cidades.forEach(cidade => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cidade.id}</td>
                <td>${cidade.nome}</td>
                <td>${cidade.estado_nome}</td>
                <td>${cidade.total_acompanhantes}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editCidade(${cidade.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCidade(${cidade.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        showAlert('Erro ao carregar cidades', 'danger');
    }
}

// Funções de CRUD (placeholders)
function showAddAcompanhanteModal() {
    showAlert('Funcionalidade de adicionar acompanhante em desenvolvimento', 'info');
}

function editAcompanhante(id) {
    showAlert(`Editar acompanhante ${id} - Funcionalidade em desenvolvimento`, 'info');
}

function deleteAcompanhante(id) {
    if (confirm('Tem certeza que deseja excluir esta acompanhante?')) {
        showAlert(`Excluir acompanhante ${id} - Funcionalidade em desenvolvimento`, 'info');
    }
}

function showAddEstadoModal() {
    showAlert('Funcionalidade de adicionar estado em desenvolvimento', 'info');
}

function editEstado(id) {
    showAlert(`Editar estado ${id} - Funcionalidade em desenvolvimento`, 'info');
}

function deleteEstado(id) {
    if (confirm('Tem certeza que deseja excluir este estado?')) {
        showAlert(`Excluir estado ${id} - Funcionalidade em desenvolvimento`, 'info');
    }
}

function showAddCidadeModal() {
    showAlert('Funcionalidade de adicionar cidade em desenvolvimento', 'info');
}

function editCidade(id) {
    showAlert(`Editar cidade ${id} - Funcionalidade em desenvolvimento`, 'info');
}

function deleteCidade(id) {
    if (confirm('Tem certeza que deseja excluir esta cidade?')) {
        showAlert(`Excluir cidade ${id} - Funcionalidade em desenvolvimento`, 'info');
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('adminToken');
        currentUser = null;
        isLoggedIn = false;
        document.getElementById('adminInterface').style.display = 'none';
        showLoginModal();
    }
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Utilitários
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}


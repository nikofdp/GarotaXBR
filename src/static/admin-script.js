// Admin Panel JavaScript
const API_BASE_URL = '/api';
let isLoggedIn = false;
let currentUser = null;
let currentEditingId = null;

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

// ===== ACOMPANHANTES =====

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

// Mostrar modal para adicionar acompanhante
async function showAddAcompanhanteModal() {
    currentEditingId = null;
    document.getElementById('acompanhanteModalTitle').textContent = 'Adicionar Acompanhante';
    document.getElementById('acompanhanteForm').reset();
    
    // Carregar cidades no select
    await loadCidadesSelect('acompanhanteCidade');
    
    const modal = new bootstrap.Modal(document.getElementById('acompanhanteModal'));
    modal.show();
}

// Editar acompanhante
async function editAcompanhante(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/acompanhantes/${id}`);
        const acompanhante = await response.json();
        
        currentEditingId = id;
        document.getElementById('acompanhanteModalTitle').textContent = 'Editar Acompanhante';
        
        // Preencher formulário
        document.getElementById('acompanhanteId').value = acompanhante.id;
        document.getElementById('acompanhanteNome').value = acompanhante.nome;
        document.getElementById('acompanhanteIdade').value = acompanhante.idade;
        document.getElementById('acompanhanteTelefone').value = acompanhante.telefone || '';
        document.getElementById('acompanhanteWhatsapp').value = acompanhante.whatsapp || '';
        document.getElementById('acompanhanteEndereco').value = acompanhante.endereco_aproximado || '';
        document.getElementById('acompanhanteDescricao').value = acompanhante.descricao || '';
        document.getElementById('acompanhanteInstagram').value = acompanhante.instagram || '';
        document.getElementById('acompanhanteFacebook').value = acompanhante.facebook || '';
        document.getElementById('acompanhanteBlog').value = acompanhante.blog || '';
        document.getElementById('acompanhanteVerificada').checked = acompanhante.verificada;
        
        // Carregar cidades e selecionar a atual
        await loadCidadesSelect('acompanhanteCidade');
        document.getElementById('acompanhanteCidade').value = acompanhante.cidade_id;
        
        const modal = new bootstrap.Modal(document.getElementById('acompanhanteModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar acompanhante:', error);
        showAlert('Erro ao carregar dados da acompanhante', 'danger');
    }
}

// Salvar acompanhante
async function saveAcompanhante() {
    const form = document.getElementById('acompanhanteForm');
    const formData = new FormData(form);
    
    const data = {
        nome: formData.get('nome'),
        idade: parseInt(formData.get('idade')),
        cidade_id: parseInt(formData.get('cidade_id')),
        telefone: formData.get('telefone'),
        whatsapp: formData.get('whatsapp'),
        endereco_aproximado: formData.get('endereco_aproximado'),
        descricao: formData.get('descricao'),
        instagram: formData.get('instagram'),
        facebook: formData.get('facebook'),
        blog: formData.get('blog'),
        verificada: document.getElementById('acompanhanteVerificada').checked
    };
    
    try {
        let response;
        if (currentEditingId) {
            // Editar
            response = await fetch(`${API_BASE_URL}/acompanhantes/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            // Adicionar
            response = await fetch(`${API_BASE_URL}/acompanhantes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('acompanhanteModal'));
            modal.hide();
            loadAcompanhantes();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao salvar acompanhante:', error);
        showAlert('Erro ao salvar acompanhante', 'danger');
    }
}

// Excluir acompanhante
async function deleteAcompanhante(id) {
    if (!confirm('Tem certeza que deseja desativar esta acompanhante?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/acompanhantes/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            loadAcompanhantes();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao excluir acompanhante:', error);
        showAlert('Erro ao excluir acompanhante', 'danger');
    }
}

// ===== ESTADOS =====

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

// Mostrar modal para adicionar estado
function showAddEstadoModal() {
    currentEditingId = null;
    document.getElementById('estadoModalTitle').textContent = 'Adicionar Estado';
    document.getElementById('estadoForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('estadoModal'));
    modal.show();
}

// Editar estado
async function editEstado(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/estados/${id}`);
        const estado = await response.json();
        
        currentEditingId = id;
        document.getElementById('estadoModalTitle').textContent = 'Editar Estado';
        
        // Preencher formulário
        document.getElementById('estadoId').value = estado.id;
        document.getElementById('estadoNome').value = estado.nome;
        document.getElementById('estadoSigla').value = estado.sigla;
        document.getElementById('estadoRegiao').value = estado.regiao;
        
        const modal = new bootstrap.Modal(document.getElementById('estadoModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
        showAlert('Erro ao carregar dados do estado', 'danger');
    }
}

// Salvar estado
async function saveEstado() {
    const form = document.getElementById('estadoForm');
    const formData = new FormData(form);
    
    const data = {
        nome: formData.get('nome'),
        sigla: formData.get('sigla').toUpperCase(),
        regiao: formData.get('regiao')
    };
    
    try {
        let response;
        if (currentEditingId) {
            // Editar
            response = await fetch(`${API_BASE_URL}/estados/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            // Adicionar
            response = await fetch(`${API_BASE_URL}/estados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('estadoModal'));
            modal.hide();
            loadEstados();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
        showAlert('Erro ao salvar estado', 'danger');
    }
}

// Excluir estado
async function deleteEstado(id) {
    if (!confirm('Tem certeza que deseja excluir este estado?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/estados/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            loadEstados();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao excluir estado:', error);
        showAlert('Erro ao excluir estado', 'danger');
    }
}

// ===== CIDADES =====

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

// Mostrar modal para adicionar cidade
async function showAddCidadeModal() {
    currentEditingId = null;
    document.getElementById('cidadeModalTitle').textContent = 'Adicionar Cidade';
    document.getElementById('cidadeForm').reset();
    
    // Carregar estados no select
    await loadEstadosSelect('cidadeEstado');
    
    const modal = new bootstrap.Modal(document.getElementById('cidadeModal'));
    modal.show();
}

// Editar cidade
async function editCidade(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/cidades/${id}`);
        const cidade = await response.json();
        
        currentEditingId = id;
        document.getElementById('cidadeModalTitle').textContent = 'Editar Cidade';
        
        // Preencher formulário
        document.getElementById('cidadeId').value = cidade.id;
        document.getElementById('cidadeNome').value = cidade.nome;
        
        // Carregar estados e selecionar o atual
        await loadEstadosSelect('cidadeEstado');
        document.getElementById('cidadeEstado').value = cidade.estado_id;
        
        const modal = new bootstrap.Modal(document.getElementById('cidadeModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erro ao carregar cidade:', error);
        showAlert('Erro ao carregar dados da cidade', 'danger');
    }
}

// Salvar cidade
async function saveCidade() {
    const form = document.getElementById('cidadeForm');
    const formData = new FormData(form);
    
    const data = {
        nome: formData.get('nome'),
        estado_id: parseInt(formData.get('estado_id'))
    };
    
    try {
        let response;
        if (currentEditingId) {
            // Editar
            response = await fetch(`${API_BASE_URL}/cidades/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            // Adicionar
            response = await fetch(`${API_BASE_URL}/cidades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('cidadeModal'));
            modal.hide();
            loadCidades();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao salvar cidade:', error);
        showAlert('Erro ao salvar cidade', 'danger');
    }
}

// Excluir cidade
async function deleteCidade(id) {
    if (!confirm('Tem certeza que deseja excluir esta cidade?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cidades/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(result.message, 'success');
            loadCidades();
            loadDashboardData(); // Atualizar contadores
        } else {
            showAlert(result.message, 'danger');
        }
        
    } catch (error) {
        console.error('Erro ao excluir cidade:', error);
        showAlert('Erro ao excluir cidade', 'danger');
    }
}

// ===== FUNÇÕES AUXILIARES =====

// Carregar estados para select
async function loadEstadosSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/estados`);
        const estados = await response.json();
        
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione um estado</option>';
        
        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.id;
            option.textContent = `${estado.nome} (${estado.sigla})`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
    }
}

// Carregar cidades para select
async function loadCidadesSelect(selectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cidades`);
        const cidades = await response.json();
        
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Selecione uma cidade</option>';
        
        // Agrupar por estado
        const cidadesPorEstado = {};
        cidades.forEach(cidade => {
            if (!cidadesPorEstado[cidade.estado_nome]) {
                cidadesPorEstado[cidade.estado_nome] = [];
            }
            cidadesPorEstado[cidade.estado_nome].push(cidade);
        });
        
        // Criar optgroups
        Object.keys(cidadesPorEstado).sort().forEach(estadoNome => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = estadoNome;
            
            cidadesPorEstado[estadoNome].forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.id;
                option.textContent = cidade.nome;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        });
        
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
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


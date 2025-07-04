// Anunciar Script
const API_BASE_URL = '/api';
let currentStep = 1;
let estados = [];
let cidades = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadEstados();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('anunciarForm').addEventListener('submit', handleSubmit);
    
    // Estado change
    document.getElementById('estado').addEventListener('change', function() {
        const estadoId = this.value;
        loadCidadesByEstado(estadoId);
    });
    
    // Validação em tempo real
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

// Carregar estados
async function loadEstados() {
    try {
        const response = await fetch(`${API_BASE_URL}/estados`);
        estados = await response.json();
        
        const estadoSelect = document.getElementById('estado');
        estadoSelect.innerHTML = '<option value="">Selecione seu estado</option>';
        
        // Agrupar por região
        const estadosPorRegiao = {};
        estados.forEach(estado => {
            if (!estadosPorRegiao[estado.regiao]) {
                estadosPorRegiao[estado.regiao] = [];
            }
            estadosPorRegiao[estado.regiao].push(estado);
        });
        
        // Criar optgroups
        const regioes = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
        regioes.forEach(regiao => {
            if (estadosPorRegiao[regiao]) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = regiao;
                
                estadosPorRegiao[regiao].forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado.id;
                    option.textContent = `${estado.nome} (${estado.sigla})`;
                    optgroup.appendChild(option);
                });
                
                estadoSelect.appendChild(optgroup);
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        showAlert('Erro ao carregar estados. Tente recarregar a página.', 'danger');
    }
}

// Carregar cidades por estado
async function loadCidadesByEstado(estadoId) {
    const cidadeSelect = document.getElementById('cidade');
    
    if (!estadoId) {
        cidadeSelect.innerHTML = '<option value="">Primeiro selecione o estado</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/cidades/${estadoId}`);
        const cidadesDoEstado = await response.json();
        
        cidadeSelect.innerHTML = '<option value="">Selecione sua cidade</option>';
        
        cidadesDoEstado.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.id;
            option.textContent = cidade.nome;
            cidadeSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        showAlert('Erro ao carregar cidades. Tente novamente.', 'danger');
    }
}

// Navegação entre steps
function nextStep(step) {
    if (validateCurrentStep()) {
        showStep(step);
    }
}

function prevStep(step) {
    showStep(step);
}

function showStep(step) {
    // Esconder todos os steps
    document.querySelectorAll('.form-step').forEach(stepDiv => {
        stepDiv.classList.remove('active');
    });
    
    // Remover classe active de todos os indicadores
    document.querySelectorAll('.step').forEach(stepIndicator => {
        stepIndicator.classList.remove('active');
    });
    
    // Marcar steps anteriores como completed
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}`).classList.add('completed');
    }
    
    // Mostrar step atual
    document.getElementById(`formStep${step}`).classList.add('active');
    document.getElementById(`step${step}`).classList.add('active');
    
    currentStep = step;
    
    // Scroll para o topo do formulário
    document.querySelector('.form-container').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Validar step atual
function validateCurrentStep() {
    const currentStepDiv = document.getElementById(`formStep${currentStep}`);
    const requiredFields = currentStepDiv.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validar campo individual
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remover classes de erro anteriores
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Validações específicas
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    } else if (field.type === 'number' && value) {
        const num = parseInt(value);
        const min = parseInt(field.getAttribute('min'));
        const max = parseInt(field.getAttribute('max'));
        
        if (min && num < min) {
            isValid = false;
            errorMessage = `Valor mínimo: ${min}`;
        } else if (max && num > max) {
            isValid = false;
            errorMessage = `Valor máximo: ${max}`;
        }
    } else if (field.type === 'tel' && value) {
        // Validação básica de telefone
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Formato: (11) 99999-9999';
        }
    } else if (field.type === 'url' && value) {
        // Validação básica de URL
        try {
            new URL(value);
        } catch {
            isValid = false;
            errorMessage = 'URL inválida. Ex: https://exemplo.com';
        }
    }
    
    // Mostrar erro se inválido
    if (!isValid) {
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = errorMessage;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Limpar erro do campo
function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// Manipular envio do formulário
async function handleSubmit(event) {
    event.preventDefault();
    
    // Validar todos os campos
    if (!validateAllFields()) {
        showAlert('Por favor, corrija os erros no formulário.', 'danger');
        return;
    }
    
    // Coletar dados do formulário
    const formData = new FormData(event.target);
    const data = {
        nome: formData.get('nome'),
        idade: parseInt(formData.get('idade')),
        cidade_id: parseInt(formData.get('cidade_id')),
        endereco_aproximado: formData.get('endereco_aproximado') || '',
        telefone: formData.get('telefone') || '',
        whatsapp: formData.get('whatsapp'),
        instagram: formData.get('instagram') || '',
        facebook: formData.get('facebook') || '',
        blog: formData.get('blog') || '',
        descricao: formData.get('descricao'),
        verificada: false, // Novos cadastros sempre começam como não verificados
        ativa: false // Novos cadastros precisam ser aprovados
    };
    
    try {
        // Mostrar loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/acompanhantes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Sucesso
            showSuccessModal();
        } else {
            // Erro da API
            showAlert(result.message || 'Erro ao enviar cadastro. Tente novamente.', 'danger');
        }
        
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Erro ao enviar cadastro:', error);
        showAlert('Erro de conexão. Verifique sua internet e tente novamente.', 'danger');
        
        // Restaurar botão
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviar Cadastro';
        submitBtn.disabled = false;
    }
}

// Validar todos os campos
function validateAllFields() {
    const allRequiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    allRequiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Mostrar modal de sucesso
function showSuccessModal() {
    const modalHtml = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle"></i> Cadastro Enviado!
                        </h5>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h4>Obrigado pelo seu cadastro!</h4>
                        <p class="mb-3">
                            Seu anúncio foi enviado com sucesso e está sendo analisado pela nossa equipe.
                        </p>
                        <div class="alert alert-info">
                            <strong>Próximos passos:</strong><br>
                            • Nossa equipe analisará seu cadastro em até 24 horas<br>
                            • Você receberá um e-mail de confirmação<br>
                            • Após aprovação, seu anúncio ficará ativo no site
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="goToHome()">
                            <i class="fas fa-home"></i> Voltar ao Início
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
    
    // Remover modal do DOM quando fechado
    document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Voltar para a página inicial
function goToHome() {
    window.location.href = 'index.html';
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

// Formatação automática de telefone
document.addEventListener('DOMContentLoaded', function() {
    const phoneFields = document.querySelectorAll('input[type="tel"]');
    
    phoneFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 6) {
                    value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                } else if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            
            e.target.value = value;
        });
    });
});


# GarotaXBR - Site de Acompanhantes

Este é um site completo de acompanhantes similar ao garotacomlocal.com, mas com a marca "GarotaXBR". O projeto inclui um frontend responsivo e um painel de administração completo.

## 🚀 Características

- **Frontend Responsivo**: Design moderno e responsivo inspirado no site original
- **API RESTful**: Backend Flask com endpoints para gerenciar dados
- **Painel de Administração**: Interface completa para gerenciar conteúdo
- **Banco de Dados**: SQLite com modelos para acompanhantes, cidades, estados, etc.
- **Verificação de Idade**: Modal de verificação obrigatória
- **Localização GPS**: Sistema de localização por estados e cidades

## 📋 Pré-requisitos

- Python 3.11+
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação e Configuração

### 1. Clonar/Extrair o Projeto
```bash
# Se você recebeu o projeto como arquivo, extraia-o
# Se está clonando de um repositório:
git clone <url-do-repositorio>
cd garotaxbr
```

### 2. Criar e Ativar Ambiente Virtual
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate
```

### 3. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 4. Inicializar Banco de Dados
```bash
# Popular o banco com dados iniciais
python src/seed_data.py
```

### 5. Executar o Servidor
```bash
python src/main.py
```

O site estará disponível em: `http://localhost:5000`

## 🔧 Configuração do Painel de Administração

### Acesso ao Painel
- URL: `http://localhost:5000/admin.html`
- Usuário: `admin`
- Senha: `admin123`

### Funcionalidades do Painel
- **Dashboard**: Estatísticas gerais do site
- **Acompanhantes**: Gerenciar perfis de acompanhantes
- **Estados**: Gerenciar estados do Brasil
- **Cidades**: Gerenciar cidades por estado
- **Fotos**: Gerenciar imagens (em desenvolvimento)
- **Vídeos**: Gerenciar vídeos (em desenvolvimento)
- **Administradores**: Gerenciar usuários admin

## 📁 Estrutura do Projeto

```
garotaxbr/
├── src/
│   ├── models/
│   │   ├── acompanhante.py    # Modelos do banco de dados
│   │   └── user.py            # Modelo de usuário (template)
│   ├── routes/
│   │   ├── api.py             # Rotas da API REST
│   │   ├── admin.py           # Rotas do painel admin
│   │   └── user.py            # Rotas de usuário (template)
│   ├── static/
│   │   ├── index.html         # Página principal
│   │   ├── admin.html         # Painel de administração
│   │   ├── styles.css         # Estilos do frontend
│   │   ├── admin-styles.css   # Estilos do admin
│   │   ├── script.js          # JavaScript do frontend
│   │   └── admin-script.js    # JavaScript do admin
│   ├── database/
│   │   └── app.db             # Banco de dados SQLite
│   ├── main.py                # Arquivo principal do Flask
│   └── seed_data.py           # Script para popular o banco
├── venv/                      # Ambiente virtual
├── requirements.txt           # Dependências Python
└── README.md                  # Este arquivo
```

## 🌐 Endpoints da API

### Estados
- `GET /api/estados` - Listar todos os estados

### Cidades
- `GET /api/cidades` - Listar todas as cidades
- `GET /api/cidades/<estado_id>` - Listar cidades por estado

### Acompanhantes
- `GET /api/acompanhantes` - Listar todas as acompanhantes
- `GET /api/acompanhantes/<id>` - Detalhes de uma acompanhante
- `GET /api/cidades/<cidade_id>/acompanhantes` - Acompanhantes por cidade

### Busca
- `GET /api/busca?q=<termo>&cidade=<cidade>&estado=<estado>` - Buscar acompanhantes

## 🎨 Personalização

### Alterando Cores e Estilos
Edite os arquivos CSS em `src/static/`:
- `styles.css` - Estilos do frontend
- `admin-styles.css` - Estilos do painel admin

### Adicionando Novos Estados/Cidades
1. Acesse o painel de administração
2. Use as seções "Estados" e "Cidades" para adicionar novos locais
3. Ou edite o arquivo `src/seed_data.py` e execute novamente

### Modificando o Logo
Substitua o arquivo `src/static/logo.png` pela sua imagem de logo.

## 🔒 Segurança

### Alterando Credenciais de Admin
1. Edite o arquivo `src/seed_data.py`
2. Modifique as credenciais na seção de criação do usuário admin
3. Execute novamente: `python src/seed_data.py`

### Configurações de Produção
Para usar em produção:
1. Altere a `SECRET_KEY` em `src/main.py`
2. Configure um banco de dados mais robusto (PostgreSQL)
3. Use um servidor WSGI como Gunicorn
4. Configure HTTPS

## 🚀 Deploy

### Deploy Local
O projeto já está configurado para rodar localmente. Siga as instruções de instalação acima.

### Deploy em Servidor
1. Configure um servidor web (Nginx)
2. Use Gunicorn como servidor WSGI
3. Configure SSL/HTTPS
4. Configure backup do banco de dados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Certifique-se de que o ambiente virtual está ativado
3. Verifique se a porta 5000 não está sendo usada por outro processo

## 📝 Notas Importantes

- O site inclui verificação de idade obrigatória
- Todas as referências a "garotacomlocal" foram substituídas por "garotaxbr"
- O banco de dados vem pré-populado com dados de exemplo
- O painel de administração permite gerenciar todo o conteúdo
- O design é responsivo e funciona em dispositivos móveis

## 🔄 Atualizações Futuras

Funcionalidades que podem ser implementadas:
- Upload de imagens e vídeos
- Sistema de comentários/avaliações
- Integração com redes sociais
- Sistema de pagamento para anúncios
- Notificações por email
- Relatórios e analytics

---

**Desenvolvido especialmente para o usuário com base no site garotacomlocal.com**


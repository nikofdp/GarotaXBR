from flask import Blueprint, render_template_string, request, redirect, url_for, flash, session
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from wtforms import StringField
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.acompanhante import db, Estado, Cidade, Acompanhante, Foto, Video, Admin as AdminUser
import os
from werkzeug.utils import secure_filename

admin_bp = Blueprint('admin', __name__)

class AuthenticatedModelView(ModelView):
    def is_accessible(self):
        return session.get('admin_logged_in', False)
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin.login'))

class MyAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return session.get('admin_logged_in', False)
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin.login'))
    
    @expose('/')
    def index(self):
        if not self.is_accessible():
            return redirect(url_for('admin.login'))
        
        # Estatísticas do dashboard
        total_acompanhantes = Acompanhante.query.filter_by(ativa=True).count()
        total_estados = Estado.query.count()
        total_cidades = Cidade.query.count()
        total_fotos = Foto.query.count()
        
        return self.render('admin/index.html', 
                         total_acompanhantes=total_acompanhantes,
                         total_estados=total_estados,
                         total_cidades=total_cidades,
                         total_fotos=total_fotos)

class EstadoModelView(AuthenticatedModelView):
    column_list = ['nome', 'sigla', 'regiao', 'created_at']
    column_searchable_list = ['nome', 'sigla']
    column_filters = ['regiao']
    form_excluded_columns = ['created_at', 'cidades']

class CidadeModelView(AuthenticatedModelView):
    column_list = ['nome', 'estado', 'created_at']
    column_searchable_list = ['nome']
    column_filters = ['estado']
    form_excluded_columns = ['created_at', 'acompanhantes']

class AcompanhanteModelView(AuthenticatedModelView):
    column_list = ['nome', 'idade', 'cidade', 'telefone', 'ativa', 'verificada', 'created_at']
    column_searchable_list = ['nome', 'telefone']
    column_filters = ['cidade', 'ativa', 'verificada']
    form_excluded_columns = ['created_at', 'updated_at', 'fotos', 'videos']
    
    def on_model_change(self, form, model, is_created):
        if is_created:
            model.ativa = True

class FotoModelView(AuthenticatedModelView):
    column_list = ['filename', 'acompanhante', 'is_principal', 'created_at']
    column_filters = ['acompanhante', 'is_principal']
    form_excluded_columns = ['created_at']

class VideoModelView(AuthenticatedModelView):
    column_list = ['filename', 'acompanhante', 'created_at']
    column_filters = ['acompanhante']
    form_excluded_columns = ['created_at']

class AdminUserModelView(AuthenticatedModelView):
    column_list = ['username', 'email', 'is_active', 'created_at']
    column_searchable_list = ['username', 'email']
    column_filters = ['is_active']
    form_excluded_columns = ['created_at', 'password_hash']
    form_extra_fields = {
        'password': StringField('Password')
    }
    
    def on_model_change(self, form, model, is_created):
        if form.password.data:
            model.password_hash = generate_password_hash(form.password.data)

def init_admin(app):
    admin = Admin(app, name='GarotaXBR Admin', template_mode='bootstrap3', 
                  index_view=MyAdminIndexView(), url='/admin')
    
    # Adicionar views dos modelos
    admin.add_view(EstadoModelView(Estado, db.session, name='Estados'))
    admin.add_view(CidadeModelView(Cidade, db.session, name='Cidades'))
    admin.add_view(AcompanhanteModelView(Acompanhante, db.session, name='Acompanhantes'))
    admin.add_view(FotoModelView(Foto, db.session, name='Fotos'))
    admin.add_view(VideoModelView(Video, db.session, name='Vídeos'))
    admin.add_view(AdminUserModelView(AdminUser, db.session, name='Administradores'))
    
    return admin

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        admin_user = AdminUser.query.filter_by(username=username, is_active=True).first()
        
        if admin_user and check_password_hash(admin_user.password_hash, password):
            session['admin_logged_in'] = True
            session['admin_user_id'] = admin_user.id
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('admin.index'))
        else:
            flash('Usuário ou senha inválidos!', 'error')
    
    login_template = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>GarotaXBR Admin - Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card mt-5">
                        <div class="card-header">
                            <h3 class="text-center">GarotaXBR Admin</h3>
                        </div>
                        <div class="card-body">
                            {% with messages = get_flashed_messages(with_categories=true) %}
                                {% if messages %}
                                    {% for category, message in messages %}
                                        <div class="alert alert-{{ 'danger' if category == 'error' else 'success' }}">
                                            {{ message }}
                                        </div>
                                    {% endfor %}
                                {% endif %}
                            {% endwith %}
                            
                            <form method="POST">
                                <div class="mb-3">
                                    <label for="username" class="form-label">Usuário</label>
                                    <input type="text" class="form-control" id="username" name="username" required>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Entrar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    '''
    
    return render_template_string(login_template)

@admin_bp.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_user_id', None)
    flash('Logout realizado com sucesso!', 'success')
    return redirect(url_for('admin.login'))


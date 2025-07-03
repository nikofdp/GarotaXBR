from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Estado(db.Model):
    __tablename__ = 'estados'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    sigla = db.Column(db.String(2), nullable=False, unique=True)
    regiao = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento com cidades
    cidades = db.relationship('Cidade', backref='estado', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Estado {self.nome}>'

class Cidade(db.Model):
    __tablename__ = 'cidades'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey('estados.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento com acompanhantes
    acompanhantes = db.relationship('Acompanhante', backref='cidade', lazy=True)
    
    def __repr__(self):
        return f'<Cidade {self.nome}>'

class Acompanhante(db.Model):
    __tablename__ = 'acompanhantes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    whatsapp = db.Column(db.String(20))
    descricao = db.Column(db.Text)
    endereco_aproximado = db.Column(db.String(200))
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=False)
    ativa = db.Column(db.Boolean, default=True)
    verificada = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Links para redes sociais
    instagram = db.Column(db.String(200))
    facebook = db.Column(db.String(200))
    blog = db.Column(db.String(200))
    
    # Relacionamentos
    fotos = db.relationship('Foto', backref='acompanhante', lazy=True, cascade='all, delete-orphan')
    videos = db.relationship('Video', backref='acompanhante', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Acompanhante {self.nome}>'

class Foto(db.Model):
    __tablename__ = 'fotos'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(200))
    acompanhante_id = db.Column(db.Integer, db.ForeignKey('acompanhantes.id'), nullable=False)
    is_principal = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Foto {self.filename}>'

class Video(db.Model):
    __tablename__ = 'videos'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(200))
    acompanhante_id = db.Column(db.Integer, db.ForeignKey('acompanhantes.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Video {self.filename}>'

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Admin {self.username}>'


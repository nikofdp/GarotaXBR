from flask import Blueprint, jsonify, request, current_app
from flask_restful import Api, Resource
from src.models.acompanhante import db, Estado, Cidade, Acompanhante, Foto, Video
import os

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

class EstadosResource(Resource):
    def get(self):
        estados = Estado.query.all()
        return jsonify([{
            'id': estado.id,
            'nome': estado.nome,
            'sigla': estado.sigla,
            'regiao': estado.regiao,
            'total_cidades': len(estado.cidades)
        } for estado in estados])

class CidadesResource(Resource):
    def get(self, estado_id=None):
        if estado_id:
            cidades = Cidade.query.filter_by(estado_id=estado_id).all()
        else:
            cidades = Cidade.query.all()
        
        return jsonify([{
            'id': cidade.id,
            'nome': cidade.nome,
            'estado_id': cidade.estado_id,
            'estado_nome': cidade.estado.nome,
            'total_acompanhantes': len([a for a in cidade.acompanhantes if a.ativa])
        } for cidade in cidades])

class AcompanhantesResource(Resource):
    def get(self, cidade_id=None, acompanhante_id=None):
        if acompanhante_id:
            # Retorna uma acompanhante específica
            acompanhante = Acompanhante.query.filter_by(id=acompanhante_id, ativa=True).first()
            if not acompanhante:
                return {'message': 'Acompanhante não encontrada'}, 404
            
            return jsonify({
                'id': acompanhante.id,
                'nome': acompanhante.nome,
                'idade': acompanhante.idade,
                'telefone': acompanhante.telefone,
                'whatsapp': acompanhante.whatsapp,
                'descricao': acompanhante.descricao,
                'endereco_aproximado': acompanhante.endereco_aproximado,
                'cidade': {
                    'id': acompanhante.cidade.id,
                    'nome': acompanhante.cidade.nome,
                    'estado': acompanhante.cidade.estado.nome
                },
                'instagram': acompanhante.instagram,
                'facebook': acompanhante.facebook,
                'blog': acompanhante.blog,
                'verificada': acompanhante.verificada,
                'fotos': [{
                    'id': foto.id,
                    'filename': foto.filename,
                    'is_principal': foto.is_principal
                } for foto in acompanhante.fotos],
                'videos': [{
                    'id': video.id,
                    'filename': video.filename
                } for video in acompanhante.videos]
            })
        
        elif cidade_id:
            # Retorna acompanhantes de uma cidade específica
            acompanhantes = Acompanhante.query.filter_by(cidade_id=cidade_id, ativa=True).all()
        else:
            # Retorna todas as acompanhantes ativas
            acompanhantes = Acompanhante.query.filter_by(ativa=True).all()
        
        return jsonify([{
            'id': acompanhante.id,
            'nome': acompanhante.nome,
            'idade': acompanhante.idade,
            'cidade': {
                'id': acompanhante.cidade.id,
                'nome': acompanhante.cidade.nome,
                'estado': acompanhante.cidade.estado.nome
            },
            'foto_principal': next((foto.filename for foto in acompanhante.fotos if foto.is_principal), 
                                 acompanhante.fotos[0].filename if acompanhante.fotos else None),
            'verificada': acompanhante.verificada
        } for acompanhante in acompanhantes])

class BuscaResource(Resource):
    def get(self):
        termo = request.args.get('q', '').strip()
        cidade = request.args.get('cidade', '').strip()
        estado = request.args.get('estado', '').strip()
        
        query = Acompanhante.query.filter_by(ativa=True)
        
        if termo:
            query = query.filter(Acompanhante.nome.contains(termo))
        
        if cidade:
            query = query.join(Cidade).filter(Cidade.nome.contains(cidade))
        
        if estado:
            query = query.join(Cidade).join(Estado).filter(Estado.nome.contains(estado))
        
        acompanhantes = query.all()
        
        return jsonify([{
            'id': acompanhante.id,
            'nome': acompanhante.nome,
            'idade': acompanhante.idade,
            'cidade': {
                'id': acompanhante.cidade.id,
                'nome': acompanhante.cidade.nome,
                'estado': acompanhante.cidade.estado.nome
            },
            'foto_principal': next((foto.filename for foto in acompanhante.fotos if foto.is_principal), 
                                 acompanhante.fotos[0].filename if acompanhante.fotos else None),
            'verificada': acompanhante.verificada
        } for acompanhante in acompanhantes])

# Registrar recursos da API
api.add_resource(EstadosResource, '/estados')
api.add_resource(CidadesResource, '/cidades', '/cidades/<int:estado_id>')
api.add_resource(AcompanhantesResource, 
                '/acompanhantes', 
                '/acompanhantes/<int:acompanhante_id>',
                '/cidades/<int:cidade_id>/acompanhantes')
api.add_resource(BuscaResource, '/busca')


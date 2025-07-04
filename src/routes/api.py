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
    
    def post(self):
        data = request.get_json()
        
        if not data or not all(k in data for k in ('nome', 'sigla', 'regiao')):
            return {'message': 'Dados incompletos. Nome, sigla e região são obrigatórios.'}, 400
        
        # Verificar se já existe um estado com a mesma sigla
        if Estado.query.filter_by(sigla=data['sigla']).first():
            return {'message': 'Já existe um estado com esta sigla.'}, 400
        
        try:
            estado = Estado(
                nome=data['nome'],
                sigla=data['sigla'].upper(),
                regiao=data['regiao']
            )
            db.session.add(estado)
            db.session.commit()
            
            return {
                'message': 'Estado criado com sucesso!',
                'estado': {
                    'id': estado.id,
                    'nome': estado.nome,
                    'sigla': estado.sigla,
                    'regiao': estado.regiao,
                    'total_cidades': 0
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao criar estado: {str(e)}'}, 500

class EstadoResource(Resource):
    def get(self, estado_id):
        estado = Estado.query.get_or_404(estado_id)
        return jsonify({
            'id': estado.id,
            'nome': estado.nome,
            'sigla': estado.sigla,
            'regiao': estado.regiao,
            'total_cidades': len(estado.cidades)
        })
    
    def put(self, estado_id):
        estado = Estado.query.get_or_404(estado_id)
        data = request.get_json()
        
        if not data:
            return {'message': 'Nenhum dado fornecido.'}, 400
        
        try:
            if 'nome' in data:
                estado.nome = data['nome']
            if 'sigla' in data:
                # Verificar se a nova sigla já existe (exceto para o estado atual)
                existing = Estado.query.filter_by(sigla=data['sigla']).first()
                if existing and existing.id != estado_id:
                    return {'message': 'Já existe um estado com esta sigla.'}, 400
                estado.sigla = data['sigla'].upper()
            if 'regiao' in data:
                estado.regiao = data['regiao']
            
            db.session.commit()
            
            return {
                'message': 'Estado atualizado com sucesso!',
                'estado': {
                    'id': estado.id,
                    'nome': estado.nome,
                    'sigla': estado.sigla,
                    'regiao': estado.regiao,
                    'total_cidades': len(estado.cidades)
                }
            }
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao atualizar estado: {str(e)}'}, 500
    
    def delete(self, estado_id):
        estado = Estado.query.get_or_404(estado_id)
        
        # Verificar se há cidades associadas
        if estado.cidades:
            return {'message': 'Não é possível excluir um estado que possui cidades associadas.'}, 400
        
        try:
            db.session.delete(estado)
            db.session.commit()
            return {'message': 'Estado excluído com sucesso!'}
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao excluir estado: {str(e)}'}, 500

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
    
    def post(self):
        data = request.get_json()
        
        if not data or not all(k in data for k in ('nome', 'estado_id')):
            return {'message': 'Dados incompletos. Nome e estado_id são obrigatórios.'}, 400
        
        # Verificar se o estado existe
        estado = Estado.query.get(data['estado_id'])
        if not estado:
            return {'message': 'Estado não encontrado.'}, 404
        
        # Verificar se já existe uma cidade com o mesmo nome no estado
        if Cidade.query.filter_by(nome=data['nome'], estado_id=data['estado_id']).first():
            return {'message': 'Já existe uma cidade com este nome neste estado.'}, 400
        
        try:
            cidade = Cidade(
                nome=data['nome'],
                estado_id=data['estado_id']
            )
            db.session.add(cidade)
            db.session.commit()
            
            return {
                'message': 'Cidade criada com sucesso!',
                'cidade': {
                    'id': cidade.id,
                    'nome': cidade.nome,
                    'estado_id': cidade.estado_id,
                    'estado_nome': cidade.estado.nome,
                    'total_acompanhantes': 0
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao criar cidade: {str(e)}'}, 500

class CidadeResource(Resource):
    def get(self, cidade_id):
        cidade = Cidade.query.get_or_404(cidade_id)
        return jsonify({
            'id': cidade.id,
            'nome': cidade.nome,
            'estado_id': cidade.estado_id,
            'estado_nome': cidade.estado.nome,
            'total_acompanhantes': len([a for a in cidade.acompanhantes if a.ativa])
        })
    
    def put(self, cidade_id):
        cidade = Cidade.query.get_or_404(cidade_id)
        data = request.get_json()
        
        if not data:
            return {'message': 'Nenhum dado fornecido.'}, 400
        
        try:
            if 'nome' in data:
                # Verificar se já existe uma cidade com o mesmo nome no estado
                existing = Cidade.query.filter_by(nome=data['nome'], estado_id=cidade.estado_id).first()
                if existing and existing.id != cidade_id:
                    return {'message': 'Já existe uma cidade com este nome neste estado.'}, 400
                cidade.nome = data['nome']
            
            if 'estado_id' in data:
                # Verificar se o novo estado existe
                estado = Estado.query.get(data['estado_id'])
                if not estado:
                    return {'message': 'Estado não encontrado.'}, 404
                cidade.estado_id = data['estado_id']
            
            db.session.commit()
            
            return {
                'message': 'Cidade atualizada com sucesso!',
                'cidade': {
                    'id': cidade.id,
                    'nome': cidade.nome,
                    'estado_id': cidade.estado_id,
                    'estado_nome': cidade.estado.nome,
                    'total_acompanhantes': len([a for a in cidade.acompanhantes if a.ativa])
                }
            }
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao atualizar cidade: {str(e)}'}, 500
    
    def delete(self, cidade_id):
        cidade = Cidade.query.get_or_404(cidade_id)
        
        # Verificar se há acompanhantes associadas
        if any(a.ativa for a in cidade.acompanhantes):
            return {'message': 'Não é possível excluir uma cidade que possui acompanhantes ativas.'}, 400
        
        try:
            db.session.delete(cidade)
            db.session.commit()
            return {'message': 'Cidade excluída com sucesso!'}
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao excluir cidade: {str(e)}'}, 500

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
            'telefone': acompanhante.telefone,
            'cidade': {
                'id': acompanhante.cidade.id,
                'nome': acompanhante.cidade.nome,
                'estado': acompanhante.cidade.estado.nome
            },
            'foto_principal': next((foto.filename for foto in acompanhante.fotos if foto.is_principal), 
                                 acompanhante.fotos[0].filename if acompanhante.fotos else None),
            'verificada': acompanhante.verificada
        } for acompanhante in acompanhantes])
    
    def post(self):
        data = request.get_json()
        
        required_fields = ['nome', 'idade', 'cidade_id']
        if not data or not all(k in data for k in required_fields):
            return {'message': 'Dados incompletos. Nome, idade e cidade_id são obrigatórios.'}, 400
        
        # Verificar se a cidade existe
        cidade = Cidade.query.get(data['cidade_id'])
        if not cidade:
            return {'message': 'Cidade não encontrada.'}, 404
        
        try:
            acompanhante = Acompanhante(
                nome=data['nome'],
                idade=data['idade'],
                cidade_id=data['cidade_id'],
                telefone=data.get('telefone', ''),
                whatsapp=data.get('whatsapp', ''),
                descricao=data.get('descricao', ''),
                endereco_aproximado=data.get('endereco_aproximado', ''),
                instagram=data.get('instagram', ''),
                facebook=data.get('facebook', ''),
                blog=data.get('blog', ''),
                verificada=data.get('verificada', False),
                ativa=True
            )
            db.session.add(acompanhante)
            db.session.commit()
            
            return {
                'message': 'Acompanhante criada com sucesso!',
                'acompanhante': {
                    'id': acompanhante.id,
                    'nome': acompanhante.nome,
                    'idade': acompanhante.idade,
                    'telefone': acompanhante.telefone,
                    'cidade': {
                        'id': acompanhante.cidade.id,
                        'nome': acompanhante.cidade.nome,
                        'estado': acompanhante.cidade.estado.nome
                    },
                    'verificada': acompanhante.verificada
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao criar acompanhante: {str(e)}'}, 500

class AcompanhanteResource(Resource):
    def get(self, acompanhante_id):
        acompanhante = Acompanhante.query.get_or_404(acompanhante_id)
        return jsonify({
            'id': acompanhante.id,
            'nome': acompanhante.nome,
            'idade': acompanhante.idade,
            'telefone': acompanhante.telefone,
            'whatsapp': acompanhante.whatsapp,
            'descricao': acompanhante.descricao,
            'endereco_aproximado': acompanhante.endereco_aproximado,
            'cidade_id': acompanhante.cidade_id,
            'cidade': {
                'id': acompanhante.cidade.id,
                'nome': acompanhante.cidade.nome,
                'estado': acompanhante.cidade.estado.nome
            },
            'instagram': acompanhante.instagram,
            'facebook': acompanhante.facebook,
            'blog': acompanhante.blog,
            'verificada': acompanhante.verificada,
            'ativa': acompanhante.ativa
        })
    
    def put(self, acompanhante_id):
        acompanhante = Acompanhante.query.get_or_404(acompanhante_id)
        data = request.get_json()
        
        if not data:
            return {'message': 'Nenhum dado fornecido.'}, 400
        
        try:
            # Atualizar campos se fornecidos
            if 'nome' in data:
                acompanhante.nome = data['nome']
            if 'idade' in data:
                acompanhante.idade = data['idade']
            if 'telefone' in data:
                acompanhante.telefone = data['telefone']
            if 'whatsapp' in data:
                acompanhante.whatsapp = data['whatsapp']
            if 'descricao' in data:
                acompanhante.descricao = data['descricao']
            if 'endereco_aproximado' in data:
                acompanhante.endereco_aproximado = data['endereco_aproximado']
            if 'instagram' in data:
                acompanhante.instagram = data['instagram']
            if 'facebook' in data:
                acompanhante.facebook = data['facebook']
            if 'blog' in data:
                acompanhante.blog = data['blog']
            if 'verificada' in data:
                acompanhante.verificada = data['verificada']
            if 'ativa' in data:
                acompanhante.ativa = data['ativa']
            
            if 'cidade_id' in data:
                # Verificar se a nova cidade existe
                cidade = Cidade.query.get(data['cidade_id'])
                if not cidade:
                    return {'message': 'Cidade não encontrada.'}, 404
                acompanhante.cidade_id = data['cidade_id']
            
            db.session.commit()
            
            return {
                'message': 'Acompanhante atualizada com sucesso!',
                'acompanhante': {
                    'id': acompanhante.id,
                    'nome': acompanhante.nome,
                    'idade': acompanhante.idade,
                    'telefone': acompanhante.telefone,
                    'cidade': {
                        'id': acompanhante.cidade.id,
                        'nome': acompanhante.cidade.nome,
                        'estado': acompanhante.cidade.estado.nome
                    },
                    'verificada': acompanhante.verificada
                }
            }
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao atualizar acompanhante: {str(e)}'}, 500
    
    def delete(self, acompanhante_id):
        acompanhante = Acompanhante.query.get_or_404(acompanhante_id)
        
        try:
            # Em vez de deletar fisicamente, marcar como inativa
            acompanhante.ativa = False
            db.session.commit()
            return {'message': 'Acompanhante desativada com sucesso!'}
        except Exception as e:
            db.session.rollback()
            return {'message': f'Erro ao desativar acompanhante: {str(e)}'}, 500

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
api.add_resource(EstadoResource, '/estados/<int:estado_id>')
api.add_resource(CidadesResource, '/cidades', '/cidades/<int:estado_id>')
api.add_resource(CidadeResource, '/cidades/<int:cidade_id>')
api.add_resource(AcompanhantesResource, 
                '/acompanhantes', 
                '/cidades/<int:cidade_id>/acompanhantes')
api.add_resource(AcompanhanteResource, '/acompanhantes/<int:acompanhante_id>')
api.add_resource(BuscaResource, '/busca')


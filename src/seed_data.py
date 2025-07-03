import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app
from src.models.acompanhante import db, Estado, Cidade, Acompanhante, Admin
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        # Limpar dados existentes
        db.drop_all()
        db.create_all()
        
        # Criar usuário admin padrão
        admin_user = Admin(
            username='admin',
            email='admin@garotaxbr.com',
            password_hash=generate_password_hash('admin123'),
            is_active=True
        )
        db.session.add(admin_user)
        
        # Estados e suas regiões
        estados_data = [
            # Região Sudeste
            {'nome': 'São Paulo', 'sigla': 'SP', 'regiao': 'Sudeste'},
            {'nome': 'Rio de Janeiro', 'sigla': 'RJ', 'regiao': 'Sudeste'},
            {'nome': 'Minas Gerais', 'sigla': 'MG', 'regiao': 'Sudeste'},
            {'nome': 'Espírito Santo', 'sigla': 'ES', 'regiao': 'Sudeste'},
            
            # Região Sul
            {'nome': 'Paraná', 'sigla': 'PR', 'regiao': 'Sul'},
            {'nome': 'Santa Catarina', 'sigla': 'SC', 'regiao': 'Sul'},
            {'nome': 'Rio Grande do Sul', 'sigla': 'RS', 'regiao': 'Sul'},
            
            # Região Centro-Oeste
            {'nome': 'Distrito Federal', 'sigla': 'DF', 'regiao': 'Centro-Oeste'},
            {'nome': 'Goiás', 'sigla': 'GO', 'regiao': 'Centro-Oeste'},
            {'nome': 'Mato Grosso', 'sigla': 'MT', 'regiao': 'Centro-Oeste'},
            {'nome': 'Mato Grosso do Sul', 'sigla': 'MS', 'regiao': 'Centro-Oeste'},
            
            # Região Nordeste
            {'nome': 'Bahia', 'sigla': 'BA', 'regiao': 'Nordeste'},
            {'nome': 'Pernambuco', 'sigla': 'PE', 'regiao': 'Nordeste'},
            {'nome': 'Ceará', 'sigla': 'CE', 'regiao': 'Nordeste'},
            
            # Região Norte
            {'nome': 'Amazonas', 'sigla': 'AM', 'regiao': 'Norte'},
            {'nome': 'Pará', 'sigla': 'PA', 'regiao': 'Norte'},
        ]
        
        estados = {}
        for estado_data in estados_data:
            estado = Estado(**estado_data)
            db.session.add(estado)
            estados[estado_data['sigla']] = estado
        
        # Cidades principais
        cidades_data = [
            # São Paulo
            {'nome': 'São Paulo', 'estado': 'SP'},
            {'nome': 'Campinas', 'estado': 'SP'},
            {'nome': 'Santos', 'estado': 'SP'},
            {'nome': 'São José dos Campos', 'estado': 'SP'},
            {'nome': 'Ribeirão Preto', 'estado': 'SP'},
            {'nome': 'São Bernardo do Campo', 'estado': 'SP'},
            {'nome': 'Sorocaba', 'estado': 'SP'},
            {'nome': 'Guarulhos', 'estado': 'SP'},
            
            # Rio de Janeiro
            {'nome': 'Rio de Janeiro', 'estado': 'RJ'},
            {'nome': 'Niterói', 'estado': 'RJ'},
            {'nome': 'Nova Iguaçu', 'estado': 'RJ'},
            
            # Minas Gerais
            {'nome': 'Belo Horizonte', 'estado': 'MG'},
            {'nome': 'Juiz de Fora', 'estado': 'MG'},
            {'nome': 'Contagem', 'estado': 'MG'},
            {'nome': 'Uberlândia', 'estado': 'MG'},
            
            # Paraná
            {'nome': 'Curitiba', 'estado': 'PR'},
            {'nome': 'Londrina', 'estado': 'PR'},
            {'nome': 'Maringá', 'estado': 'PR'},
            
            # Santa Catarina
            {'nome': 'Florianópolis', 'estado': 'SC'},
            {'nome': 'Joinville', 'estado': 'SC'},
            {'nome': 'Balneário Camboriú', 'estado': 'SC'},
            
            # Rio Grande do Sul
            {'nome': 'Porto Alegre', 'estado': 'RS'},
            {'nome': 'Canoas', 'estado': 'RS'},
            {'nome': 'Caxias do Sul', 'estado': 'RS'},
            
            # Distrito Federal
            {'nome': 'Brasília', 'estado': 'DF'},
        ]
        
        cidades = {}
        for cidade_data in cidades_data:
            cidade = Cidade(
                nome=cidade_data['nome'],
                estado=estados[cidade_data['estado']]
            )
            db.session.add(cidade)
            cidades[cidade_data['nome']] = cidade
        
        # Commit para garantir que os IDs sejam gerados
        db.session.commit()
        
        # Acompanhantes de exemplo
        acompanhantes_data = [
            {
                'nome': 'Ana Paula',
                'idade': 25,
                'telefone': '(11) 99999-1111',
                'whatsapp': '(11) 99999-1111',
                'descricao': 'Acompanhante carinhosa e educada. Atendo com local próprio.',
                'endereco_aproximado': 'Centro de São Paulo',
                'cidade': cidades['São Paulo'],
                'instagram': '@anapaula_sp',
                'verificada': True
            },
            {
                'nome': 'Carla Santos',
                'idade': 28,
                'telefone': '(21) 99999-2222',
                'whatsapp': '(21) 99999-2222',
                'descricao': 'Acompanhante de luxo no Rio de Janeiro. Discreta e elegante.',
                'endereco_aproximado': 'Copacabana',
                'cidade': cidades['Rio de Janeiro'],
                'blog': 'https://carlasantos.blog.br',
                'verificada': True
            },
            {
                'nome': 'Juliana Lima',
                'idade': 23,
                'telefone': '(31) 99999-3333',
                'whatsapp': '(31) 99999-3333',
                'descricao': 'Jovem e carinhosa em Belo Horizonte. Atendimento VIP.',
                'endereco_aproximado': 'Savassi',
                'cidade': cidades['Belo Horizonte'],
                'facebook': 'juliana.lima.bh',
                'verificada': False
            },
            {
                'nome': 'Fernanda Costa',
                'idade': 30,
                'telefone': '(41) 99999-4444',
                'whatsapp': '(41) 99999-4444',
                'descricao': 'Acompanhante experiente em Curitiba. Local discreto.',
                'endereco_aproximado': 'Batel',
                'cidade': cidades['Curitiba'],
                'verificada': True
            },
        ]
        
        for acomp_data in acompanhantes_data:
            acompanhante = Acompanhante(**acomp_data)
            db.session.add(acompanhante)
        
        db.session.commit()
        print("Banco de dados populado com sucesso!")
        print("Usuário admin criado:")
        print("  Username: admin")
        print("  Password: admin123")

if __name__ == '__main__':
    seed_database()


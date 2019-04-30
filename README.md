### Estrutura de diretórios do projeto

A estrutura inicial do projeto é:

``` 
<PROJECT_NAME>
└── code
   └── bin
       ├── build.sh
       └── install.sh
```

Onde:
- `<PROJECT_NAME>/code`: Diretório raiz do código do projeto. O código fonte será copiado a partir desse diretório.

- `<PROJECT_NAME>/bin/build.sh`: Comandos de build do projeto.

- `<PROJECT_NAME>/bin/install.sh`: Comandos a serem executados após o build.

**Observações**: 
- Todos os arquivos citados acima são requeridos para o funcionamento correto da build.
- Nesse caso não há necessidade do Dockerfile pois o ambiente não usará containers.


### Publicação do código

Para publicar o projeto, basta comitar o código normalmente no diretório code, e um webhook irá executar a build no Jenkins, atualizando o projeto.

- O projeto será protegido por usuário e senha.

- Para acessar o ambiente de **homologação** do projeto acesse o link `<PROJECT_NAME>.isobarhom.com.br` ou `<PROJECT_NAME>.dentsuaegishom.com.br`.

- Para acessar o ambiente de **desenvolvimento** do projeto acesse o link `<PROJECT_NAME>.isobardev.com.br` ou `<PROJECT_NAME>.dentsuaegisdev.com.br`.

**Importante**:

As credenciais de acesso estarão na página principal do projeto no Gitlab, que poderá ser acessado via a URL no seguinte formato: `http://git.isobarhom.com.br/<GRUPOEMPRESA>/<PROJECT_NAME>`.
Nesse endereço haverá um link já autenticado para cada ambiente do projeto (link Ambientes: "hom" abaixo do nome do repositório).  


### Build

- `build.sh`: comandos de build do projeto - serão usados para preparar sua build.

Conteúdo inicial:
```
#!/bin/bash 
rm -rf dist
mkdir dist 
```

Se for necessária a customização desse passo, adicione seus comandos após esses comandos iniciais.


### Install

- `install.sh`: comandos a serem executados após o build. deixa os arquivos preparados para serem recebidos no container.

Conteúdo inicial:
```
#!/bin/bash 
cp -rRp code/. dist
rm -rf dist/bin/ 
``` 

Se for necessária a customização desse passo, adicione seus comandos após esses comandos iniciais.

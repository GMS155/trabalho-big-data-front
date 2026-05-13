# VehicleIQ — Dashboard de Telemetria Veicular

Dashboard para visualização de dados de telemetria veicular, construído com Next.js e consumindo uma API REST backed por Apache Spark + HDFS.

## Tecnologias

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **shadcn/ui** — componentes de UI
- **Recharts** — gráficos
- **Docker** — containerização

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Dashboard com KPIs e gráficos gerais |
| `/vehicles` | Lista de veículos com viagens em modal |
| `/trips` | Telemetria detalhada por viagem |
| `/analytics` | Análises: excesso de velocidade, rotas, paradas, combustível |
| `/anomalies` | Anomalias detectadas via z-score (RPM/MAF) |

---

## Pré-requisitos

- Docker e Docker Compose instalados
- Porta **3000** livre na máquina
- A API do backend rodando e acessível (padrão: `http://localhost:8000`)

---

## Como executar

### Linux (Ubuntu / Kubuntu)

#### 1. Instalar o Git

```bash
sudo apt update
sudo apt install -y git
```

#### 2. Instalar o Docker

```bash
# Remover versões antigas, se houver
sudo apt remove -y docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG oficial do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$UBUNTU_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine e Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

#### 3. Permitir usar Docker sem `sudo`

```bash
sudo usermod -aG docker $USER
newgrp docker
```

> Se o terminal abrir um novo shell após o `newgrp docker`, navegue de volta para a pasta do projeto antes de continuar.

#### 4. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd vehicleiq-dashboard
```

#### 5. Verificar se a porta 3000 está livre

```bash
sudo ss -tlnp | grep 3000
```

Se não aparecer nada, a porta está livre. Caso apareça algum processo, encerre-o antes de continuar:

```bash
sudo kill <PID>
```

#### 6. Configurar a URL da API

Descubra o IP do gateway Docker (necessário para o container acessar a API rodando no host):

```bash
docker network inspect bridge | grep Gateway
```

Anote o IP retornado (geralmente `172.17.0.1`).

Crie o arquivo de variáveis de ambiente:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e defina a URL da API com o IP encontrado:

```env
NEXT_PUBLIC_API_URL=http://172.17.0.1:8000
```

#### 7. Buildar e subir o container

```bash
docker compose up -d --build
```

#### 8. Acompanhar os logs

```bash
docker compose logs -f frontend
```

Aguarde aparecer a mensagem:

```
✓ Ready - started server on 0.0.0.0:3000
```

#### 9. Acessar no navegador

Abra: [http://localhost:3000](http://localhost:3000)

> Os endpoints do Spark podem demorar entre 10 e 60 segundos para responder na primeira chamada. Os spinners de carregamento ficarão visíveis enquanto os dados são processados — isso é esperado.

#### 10. Parar o ambiente

```bash
# Parar o container mantendo a imagem buildada
docker compose down

# Parar e remover tudo (imagem, volumes, cache)
docker compose down --rmi all -v
```

---

### Windows

#### 1. Instalar o Git

Baixe e instale o Git para Windows: https://git-scm.com/download/win

Mantenha as opções padrão durante a instalação.

#### 2. Instalar o Docker Desktop

Baixe e instale o Docker Desktop: https://www.docker.com/products/docker-desktop/

Requisitos:
- Windows 10 64-bit (versão 21H2 ou superior) ou Windows 11
- WSL 2 habilitado (o instalador do Docker Desktop faz isso automaticamente)
- Virtualização habilitada na BIOS

Após instalar, inicie o Docker Desktop e aguarde o ícone da baleia aparecer na bandeja do sistema com o status **Running**.

> No Windows não é necessário configurar permissões de grupo — o Docker Desktop gerencia isso automaticamente.

#### 3. Clonar o repositório

Abra o **PowerShell** ou o **Terminal** e execute:

```powershell
git clone <url-do-repositorio>
cd vehicleiq-dashboard
```

#### 4. Verificar se a porta 3000 está livre

```powershell
netstat -ano | findstr :3000
```

Se não aparecer nada, a porta está livre. Se aparecer, encerre o processo pelo Gerenciador de Tarefas ou execute:

```powershell
Stop-Process -Id <PID> -Force
```

#### 5. Configurar a URL da API

No Windows com Docker Desktop, o host é acessível pelo container via `host.docker.internal`.

Copie o arquivo de exemplo:

```powershell
copy .env.local.example .env.local
```

Edite `.env.local` com o Bloco de Notas ou VS Code:

```env
NEXT_PUBLIC_API_URL=http://host.docker.internal:8000
```

#### 6. Buildar e subir o container

```powershell
docker compose up -d --build
```

#### 7. Acompanhar os logs

```powershell
docker compose logs -f frontend
```

Aguarde aparecer a mensagem:

```
✓ Ready - started server on 0.0.0.0:3000
```

#### 8. Acessar no navegador

Abra: [http://localhost:3000](http://localhost:3000)

> Os endpoints do Spark podem demorar entre 10 e 60 segundos para responder na primeira chamada. Os spinners de carregamento ficarão visíveis enquanto os dados são processados — isso é esperado.

#### 9. Parar o ambiente

```powershell
# Parar o container mantendo a imagem buildada
docker compose down

# Parar e remover tudo (imagem, volumes, cache)
docker compose down --rmi all -v
```

---

## Estrutura de pastas

```
app/
  layout.tsx          ← sidebar + layout global
  page.tsx            ← Dashboard (/)
  vehicles/page.tsx
  trips/page.tsx
  analytics/page.tsx
  anomalies/page.tsx
components/
  Sidebar.tsx
  KpiCard.tsx
  StatusBadge.tsx
  SpeedChart.tsx
  RpmBarChart.tsx
  FuelTable.tsx
  AnomaliesTable.tsx
lib/
  api.ts              ← funções de fetch tipadas
.env.local.example    ← modelo de variáveis de ambiente
docker-compose.yml
Dockerfile
```

---

## Solução de problemas

**`permission denied` ao rodar `docker`** (Linux)
→ Execute `newgrp docker` ou faça logout e login novamente para o grupo surtir efeito.

**Porta 3000 já em uso**
→ Encerre o processo que ocupa a porta ou altere o mapeamento em `docker-compose.yml` para outra porta (ex: `3001:3000`).

**Dashboard carrega mas não exibe dados**
→ Verifique se a API está rodando: `curl http://localhost:8000/health`
→ Confirme que `NEXT_PUBLIC_API_URL` está correto em `.env.local` e que o container foi rebuildado após a alteração.

**Spinners de carregamento que não somem**
→ Os jobs Spark podem demorar mais em máquinas com poucos recursos. Aguarde até 2 minutos e recarregue a página.

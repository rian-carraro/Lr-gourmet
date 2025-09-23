
// ===============================
// Dashboard JavaScript - LR Gourmet
// ===============================
// Este arquivo controla toda a lógica do dashboard, incluindo:
// - Precificação de produtos
// - Gerenciamento de produtos
// - KPIs, gráficos, tabelas
// - Integração com localStorage
// - Navegação entre seções
// Comentários úteis foram adicionados para facilitar manutenção por iniciantes.
class DashboardManager {
    // Remove todos os produtos e embalagens cadastrados do sistema
    limparProdutosEEmbalagens() {
        this.precProdutos = [];
        this.precEmbalagens = [];
        localStorage.setItem('precProdutos', JSON.stringify([]));
        localStorage.setItem('precEmbalagens', JSON.stringify([]));
        this.renderListasDinamicas();
    }
    // Remove todos os produtos e embalagens cadastrados
    removerTodosProdutos() {
        this.precProdutos = [];
        this.precEmbalagens = [];
        localStorage.setItem('precProdutos', JSON.stringify([]));
        localStorage.setItem('precEmbalagens', JSON.stringify([]));
        this.renderListasDinamicas();
    }
    // Gera o conteúdo do relatório no elemento #reportContent
    generateReport() {
        const type = $('#reportType').val();
        const startDate = $('#reportStartDate').val();
        const endDate = $('#reportEndDate').val();
        const reportContent = $('#reportContent');
        let html = '';
        // Filtra dados conforme datas
        let data = this.realData.orders || [];
        if (startDate) {
            const start = new Date(startDate);
            data = data.filter(order => new Date(order.date) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            data = data.filter(order => new Date(order.date) <= end);
        }
        if (type === 'sales') {
            html += '<table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Pagamento</th><th>Status</th><th>Data</th></tr></thead><tbody>';
            data.forEach(order => {
                html += `<tr><td>${order.id}</td><td>${order.customer}</td><td>R$ ${order.total.toFixed(2)}</td><td>${order.payment}</td><td>${order.status}</td><td>${new Date(order.date).toLocaleDateString('pt-BR')}</td></tr>`;
            });
            html += '</tbody></table>';
        } else if (type === 'products') {
            const productStats = {};
            data.forEach(order => {
                order.items.forEach(item => {
                    const name = item.product || item.name;
                    if (!productStats[name]) productStats[name] = { vendas: 0, receita: 0 };
                    productStats[name].vendas += item.quantity;
                    productStats[name].receita += item.quantity * item.price;
                });
            });
            html += '<table class="table"><thead><tr><th>Produto</th><th>Vendas</th><th>Receita</th></tr></thead><tbody>';
            Object.entries(productStats).forEach(([name, stats]) => {
                html += `<tr><td>${name}</td><td>${stats.vendas}</td><td>R$ ${stats.receita.toFixed(2)}</td></tr>`;
            });
            html += '</tbody></table>';
        } else if (type === 'customers') {
            const customerStats = {};
            data.forEach(order => {
                if (!customerStats[order.customer]) customerStats[order.customer] = { pedidos: 0, gasto: 0 };
                customerStats[order.customer].pedidos += 1;
                customerStats[order.customer].gasto += order.total;
            });
            html += '<table class="table"><thead><tr><th>Cliente</th><th>Pedidos</th><th>Total Gasto</th></tr></thead><tbody>';
            Object.entries(customerStats).forEach(([name, stats]) => {
                html += `<tr><td>${name}</td><td>${stats.pedidos}</td><td>R$ ${stats.gasto.toFixed(2)}</td></tr>`;
            });
            html += '</tbody></table>';
        } else if (type === 'locations') {
            const bairroStats = {};
            data.forEach(order => {
                const bairro = order.bairro || 'N/A';
                if (!bairroStats[bairro]) bairroStats[bairro] = { pedidos: 0, receita: 0 };
                bairroStats[bairro].pedidos += 1;
                bairroStats[bairro].receita += order.total;
            });
            html += '<table class="table"><thead><tr><th>Bairro</th><th>Pedidos</th><th>Receita</th></tr></thead><tbody>';
            Object.entries(bairroStats).forEach(([bairro, stats]) => {
                html += `<tr><td>${bairro}</td><td>${stats.pedidos}</td><td>R$ ${stats.receita.toFixed(2)}</td></tr>`;
            });
            html += '</tbody></table>';
        } else {
            html = '<div class="alert alert-warning">Selecione um tipo de relatório.</div>';
        }
        reportContent.html(html);
        $('#reportResults').show();
    }
    // ===============================
    // MÉTODOS DE PRECIFICAÇÃO
    // ===============================
    // Renderiza as listas dinâmicas de insumos e embalagens cadastrados
    renderListasDinamicas() {
        // Renderiza insumos
        const prodContainer = $("#precListasDinamicas");
        let html = '<h5>Insumos cadastrados</h5>';
        html += '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Nome</th><th>Valor Total</th><th>Quantidade</th><th>Valor Unidade</th><th>Ações</th></tr></thead><tbody>';
        if (this.precProdutos.length === 0) {
            html += `<tr><td colspan="5" class="text-center text-muted">Nenhum produto cadastrado ainda.</td></tr>`;
        } else {
            this.precProdutos.forEach((p, idx) => {
                html += `<tr><td>${p.nome}</td><td>R$ ${p.valor.toFixed(2)}</td><td>${p.qtd}</td><td>R$ ${(p.valorUn).toFixed(2)}</td><td><button class='btn btn-sm btn-warning' onclick='dashboardManager.editarProduto(${idx})'>Editar</button> <button class='btn btn-sm btn-danger' onclick='dashboardManager.apagarProduto(${idx})'>Apagar</button></td></tr>`;
            });
        }
        html += '</tbody></table></div>';
        // Renderiza embalagens
        html += '<h5>Embalagens cadastradas</h5>';
        html += '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Nome</th><th>Valor Total</th><th>Quantidade</th><th>Valor Unidade</th><th>Ações</th></tr></thead><tbody>';
        if (this.precEmbalagens.length === 0) {
            html += `<tr><td colspan="5" class="text-center text-muted">Nenhuma embalagem cadastrada ainda.</td></tr>`;
        } else {
            this.precEmbalagens.forEach((e, idx) => {
                html += `<tr><td>${e.nome}</td><td>R$ ${e.valor.toFixed(2)}</td><td>${e.qtd}</td><td>R$ ${(e.valorUn).toFixed(2)}</td><td><button class='btn btn-sm btn-warning' onclick='dashboardManager.editarEmbalagem(${idx})'>Editar</button> <button class='btn btn-sm btn-danger' onclick='dashboardManager.apagarEmbalagem(${idx})'>Apagar</button></td></tr>`;
            });
        }
        html += '</tbody></table></div>';
        prodContainer.html(html);
    }

    // Edita produto cadastrado para precificação
    editarProduto(idx) {
        const p = this.precProdutos[idx];
        $('#precNomeProduto').val(p.nome);
        $('#precValorProduto').val(p.valor);
        $('#precQtdProduto').val(p.qtd);
        $('#precValorUnProduto').val((p.valorUn).toFixed(2));
        this.precProdutos.splice(idx, 1);
        localStorage.setItem('precProdutos', JSON.stringify(this.precProdutos));
        this.renderListasDinamicas();
    }
    // Remove produto cadastrado para precificação
    apagarProduto(idx) {
        this.precProdutos.splice(idx, 1);
        localStorage.setItem('precProdutos', JSON.stringify(this.precProdutos));
        this.renderListasDinamicas();
    }
    // Edita embalagem cadastrada para precificação
    editarEmbalagem(idx) {
        const e = this.precEmbalagens[idx];
        $('#precNomeEmbalagem').val(e.nome);
        $('#precValorEmbalagem').val(e.valor);
        $('#precQtdEmbalagem').val(e.qtd);
        $('#precValorUnEmbalagem').val((e.valorUn).toFixed(2));
        this.precEmbalagens.splice(idx, 1);
        localStorage.setItem('precEmbalagens', JSON.stringify(this.precEmbalagens));
        this.renderListasDinamicas();
    }
    // Remove embalagem cadastrada para precificação
    apagarEmbalagem(idx) {
        this.precEmbalagens.splice(idx, 1);
        localStorage.setItem('precEmbalagens', JSON.stringify(this.precEmbalagens));
        this.renderListasDinamicas();
    }
    // ===== PRECIFICAÇÃO =====
    // Arrays para armazenar insumos, embalagens e itens da precificação
    precProdutos = [];
    precEmbalagens = [];
    precItens = [];
    // Estado da aba de página selecionada no gerenciamento
    currentProductPageFilter = 'index';
    // Estado do filtro de seção selecionado no gerenciamento
    currentProductSectionFilter = 'all';

    // Inicializa dados de precificação ao abrir seção
    initPrecificacao() {
        // Carregar dados salvos
        this.precProdutos = JSON.parse(localStorage.getItem('precProdutos')) || [];
        this.precEmbalagens = JSON.parse(localStorage.getItem('precEmbalagens')) || [];
        this.precItens = [];
        this.renderPrecificacaoItens();
        this.renderListasDinamicas();
    }

    // Cadastro de produtos para precificação
    // Configura eventos dos formulários de precificação
    setupPrecificacaoEvents() {
        // Produto
        $('#precValorProduto, #precQtdProduto').on('input', function() {
            const valor = parseFloat($('#precValorProduto').val()) || 0;
            const qtd = parseFloat($('#precQtdProduto').val()) || 1;
            $('#precValorUnProduto').val(qtd > 0 ? (valor / qtd).toFixed(2) : '0.00');
        });
        $('#precificacaoProdutoForm').on('submit', (e) => {
            e.preventDefault();
            const nome = $('#precNomeProduto').val().trim();
            const valor = parseFloat($('#precValorProduto').val());
            const qtd = parseFloat($('#precQtdProduto').val());
            if (!nome || !valor || !qtd) return alert('Preencha todos os campos corretamente!');
            this.precProdutos.push({ nome, valor, qtd, valorUn: valor / qtd });
            localStorage.setItem('precProdutos', JSON.stringify(this.precProdutos));
            $('#precificacaoProdutoForm')[0].reset();
            $('#precValorUnProduto').val('');
            alert('Produto salvo!');
            this.renderListasDinamicas();
        });
        // Embalagem
        $('#precValorEmbalagem, #precQtdEmbalagem').on('input', function() {
            const valor = parseFloat($('#precValorEmbalagem').val()) || 0;
            const qtd = parseFloat($('#precQtdEmbalagem').val()) || 1;
            $('#precValorUnEmbalagem').val(qtd > 0 ? (valor / qtd).toFixed(2) : '0.00');
        });
        $('#precificacaoEmbalagemForm').on('submit', (e) => {
            e.preventDefault();
            const nome = $('#precNomeEmbalagem').val().trim();
            const valor = parseFloat($('#precValorEmbalagem').val());
            const qtd = parseFloat($('#precQtdEmbalagem').val());
            if (!nome || !valor || !qtd) return alert('Preencha todos os campos corretamente!');
            this.precEmbalagens.push({ nome, valor, qtd, valorUn: valor / qtd });
            localStorage.setItem('precEmbalagens', JSON.stringify(this.precEmbalagens));
            $('#precificacaoEmbalagemForm')[0].reset();
            $('#precValorUnEmbalagem').val('');
            alert('Embalagem salva!');
            this.renderListasDinamicas();
        });
        // Adicionar item para precificação final
        $('#addItemPrecificacao').on('click', () => this.addPrecificacaoItem());
        $('#addPrecToCardapio').on('click', () => {
            // Pega nome e valor de venda
            const nome = $('#precNomeFinal').val();
            let valor = 0;
            const resultado = $('#precResultado').text();
            const match = resultado.match(/Valor de venda:\s*R\$\s*([\d,.]+)/);
            if (match) valor = parseFloat(match[1].replace(',', '.'));
            // Navega para seção de adicionar produtos
            $('[data-section="add-products"]').trigger('click');
            setTimeout(() => {
                // Tenta preencher os campos corretos
                $('#addProductName, #productName').val(nome);
                $('#addProductPrice, #productPrice').val(valor);
            }, 400);
        });
        $('#precificacaoFinalForm').on('submit', (e) => {
            e.preventDefault();
            this.calcularPrecificacaoFinal();
        });
    }

    // Renderiza os itens adicionados para precificação final
    renderPrecificacaoItens() {
        const container = $('#precItensContainer');
        container.empty();
    this.precItens.forEach((item, idx) => {
            // Mostrar texto do select (seta vermelha)
            let selectText = '';
            if (item.tipo === 'produto') selectText = item.nome + ' (Produto)';
            else if (item.tipo === 'embalagem') selectText = item.nome + ' (Embalagem)';
            else selectText = 'Selecione Produto/Embalagem';
            // Valor total (seta amarela)
            let valorTotal = '';
            if (item.valorUn && item.qtd) valorTotal = 'R$ ' + (item.valorUn * item.qtd).toFixed(2);
            // Renderização
            container.append(`
                <div class="form-row align-items-end mb-2">
                    <div class="form-group col-md-4">
                        <select class="form-control precItemSelect" data-idx="${idx}">
                            <option value="">${selectText}</option>
                            ${this.precProdutos.map(p => `<option value="produto-${p.nome}" ${item.tipo==='produto'&&item.nome===p.nome?'selected':''}>${p.nome} (Produto)</option>`).join('')}
                            ${this.precEmbalagens.map(e => `<option value="embalagem-${e.nome}" ${item.tipo==='embalagem'&&item.nome===e.nome?'selected':''}>${e.nome} (Embalagem)</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group col-md-2">
                        <input type="number" class="form-control precItemQtd" data-idx="${idx}" value="${item.qtd ? item.qtd : ''}" min="0.01" step="0.01" placeholder="Qtd usada">
                    </div>
                    <div class="form-group col-md-2">
                        <input type="text" class="form-control precItemValorTotal" data-idx="${idx}" value="${(item.valorUn && item.qtd) ? (item.valorUn * item.qtd).toFixed(2) : ''}" readonly placeholder="Valor Total">
                    </div>
                    <div class="form-group col-md-2">
                        <button type="button" class="btn btn-danger" onclick="dashboardManager.removePrecificacaoItem(${idx})">Remover</button>
                    </div>
                </div>
            `);
        });
        // Eventos para selects e inputs
        $('.precItemSelect').off('change').on('change', (e) => {
            const idx = $(e.target).data('idx');
            const val = $(e.target).val();
            if (!val) return;
            const [tipo, nome] = val.split('-');
            let valorUn = 0;
            if (tipo === 'produto') {
                const p = this.precProdutos.find(x => x.nome === nome);
                valorUn = p ? p.valorUn : 0;
            } else {
                const e = this.precEmbalagens.find(x => x.nome === nome);
                valorUn = e ? e.valorUn : 0;
            }
            this.precItens[idx].tipo = tipo;
            this.precItens[idx].nome = nome;
            this.precItens[idx].valorUn = valorUn;
            this.renderPrecificacaoItens();
        });
        $('.precItemQtd').off('input').on('input', (e) => {
            const idx = $(e.target).data('idx');
            const raw = $(e.target).val();
            // Mantém vazio quando sem valor, evitando exibir 0 e permitindo placeholder
            this.precItens[idx].qtd = raw === '' ? '' : (parseFloat(raw) || 0);
            // Atualiza o valor total do item: só mostra quando há valorUn e qtd válidos
            const valorUn = this.precItens[idx].valorUn || 0;
            const qtd = (raw === '' ? null : (parseFloat(raw) || 0));
            const total = (valorUn && qtd) ? (valorUn * qtd).toFixed(2) : '';
            $(`.precItemValorTotal[data-idx="${idx}"]`).val(total);
        });
        $('.precItemRendimento').off('input').on('input', (e) => {
            const idx = $(e.target).data('idx');
            this.precItens[idx].rendimento = parseInt($(e.target).val()) || 1;
        });
    }

    // Adiciona novo item à precificação final
    addPrecificacaoItem() {
        // Inicia quantidade vazia para exibir placeholder, sem "0"
        this.precItens.push({ tipo: '', nome: '', qtd: '', rendimento: 1, valorUn: 0 });
        this.renderPrecificacaoItens();
    }
    // Remove item da precificação final
    removePrecificacaoItem(idx) {
        this.precItens.splice(idx, 1);
        this.renderPrecificacaoItens();
    }

    // Calcula o valor de venda do produto final
    calcularPrecificacaoFinal() {
        // Somar custo total dos itens
        let custoTotal = 0;
        this.precItens.forEach(item => {
            if (item.valorUn && item.qtd) {
                custoTotal += item.valorUn * item.qtd;
            }
        });
        // Rendimento final vem do campo do produto final
        const rendimentoFinal = parseInt($('#precRendimento').val()) || 1;
        // Custos extras
        const maoObra = parseFloat($('#precMaoObra').val()) || 0;
        const custosExtras = parseFloat($('#precCustosExtras').val()) || 0;
        let custoComExtras = custoTotal * (1 + (maoObra + custosExtras) / 100);
        // Valor de venda por unidade com fator 1.2
        const valorUnVenda = (custoComExtras / rendimentoFinal) * 1.2;
        // Exibir resultado
        $('#precResultado').html(`
            <div class="alert alert-info">
                <strong>Custo total:</strong> R$ ${custoTotal.toFixed(2)}<br>
                <strong>Custo com extras:</strong> R$ ${custoComExtras.toFixed(2)}<br>
                <strong>Rendimento final:</strong> ${rendimentoFinal} unidade(s)<br>
                <strong>Valor de venda:</strong> <span class="text-success">R$ ${valorUnVenda.toFixed(2)}</span>
            </div>
        `);
    }
    // ===============================
    // CONSTRUTOR E INICIALIZAÇÃO
    // ===============================
    constructor() {
        this.isAuthenticated = false;
        this.currentSection = 'overview';
        this.charts = {};
        this.realData = this.loadRealData();
        this.init();
    }

    // Inicializa dashboard: eventos, login, precificação
    init() {
        this.setupEventListeners();
        this.showLoginModal();
        this.setupPrecificacaoEvents();
        this.enableEnterOnForms();
        // Responsividade dos botões de ações de produtos
        this.setupResponsiveProductActions();
    }

    // Permite envio dos principais formulários ao pressionar Enter
    enableEnterOnForms() {
        // Lista de formulários principais
        const forms = [
            '#loginForm',
            '#precificacaoProdutoForm',
            '#precificacaoEmbalagemForm',
            '#precificacaoFinalForm',
            '#addProductForm',
            '#horariosForm',
            '#reportForm' // Adiciona o formulário de relatórios
        ];
        forms.forEach(selector => {
            const $form = $(selector);
            if ($form.length) {
                $form.on('keydown', function(e) {
                    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        $form.submit();
                    }
                });
            }
        });
        // Caso o formulário de relatórios não tenha id, adiciona pelo botão
        const $reportBtn = $('#generateReport');
        if ($reportBtn.length) {
            $reportBtn.closest('form').attr('id', 'reportForm');
        }
    }

    // ===============================
    // EVENTOS PRINCIPAIS DO DASHBOARD
    // ===============================
    setupEventListeners() {
        // Login
        $('#loginBtn').on('click', () => this.handleLogin());
        // Permitir login com Enter ou Tab
        $('#loginBtn').on('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                this.handleLogin();
            }
        });
        // Permitir login ao pressionar Enter em qualquer campo do formulário
        $('#loginForm').on('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLogin();
            }
        });
        $('#logoutBtn').on('click', () => this.handleLogout());
        
        // Navigation
        $('.nav-link').on('click', (e) => this.handleNavigation(e));
        
        // Mobile menu
        $('#menuToggle').on('click', (e) => {
            e.preventDefault();
            this.toggleSidebar();
        });
        // Botão X do menu lateral
        $('#sidebarToggle').on('click', (e) => {
            e.preventDefault();
            this.closeSidebar();
        });
        $('#mobileOverlay').on('click', () => this.closeSidebar());
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') this.closeSidebar();
        });
        
        // Data refresh
        $('#refreshData').on('click', () => this.refreshData());
        
        // Clear all data
        $('#clearAllData').on('click', () => this.clearAllData());
        
        // Product management
        $('#enableAllProducts').on('click', () => this.enableAllProducts());
        $('#disableAllProducts').on('click', () => this.disableAllProducts());
        // Zerar todos os produtos (novo botão no cabeçalho)
        $('#resetAllProducts').on('click', () => {
            if (confirm('⚠️ Tem certeza que deseja ZERAR TODOS os produtos do site?\n\nIsso apagará todos os produtos integrados e a disponibilidade. Esta ação não pode ser desfeita.')) {
                this.purgeCustomProducts();
                // Resetar filtros de página e seção após limpeza
                this.currentProductPageFilter = 'index';
                this.currentProductSectionFilter = 'all';
                localStorage.setItem('lrGourmetMgmtPage', this.currentProductPageFilter);
                localStorage.setItem('lrGourmetMgmtSection', this.currentProductSectionFilter);
                // Ajustar UI dos botões de página
                $('#productPageFilters .btn').removeClass('active');
                $('#productPageFilters .btn[data-page="index"]').addClass('active');
                this.populateSectionFilter();
                this.renderProductManagement();
            }
        });
        // Filtros de página (Produtos)
        $('#productPageFilters .btn').on('click', (e) => {
            e.preventDefault();
            const $btn = $(e.currentTarget);
            $('#productPageFilters .btn').removeClass('active');
            $btn.addClass('active');
            this.currentProductPageFilter = $btn.data('page') || 'index';
            localStorage.setItem('lrGourmetMgmtPage', this.currentProductPageFilter);
            // Ao mudar de página, resetar seção e repopular combo
            this.currentProductSectionFilter = 'all';
            localStorage.setItem('lrGourmetMgmtSection', this.currentProductSectionFilter);
            this.populateSectionFilter();
            this.renderProductManagement();
        });
        // Filtro de seção (Produtos)
        $('#productSectionFilter').on('change', (e) => {
            this.currentProductSectionFilter = e.currentTarget.value || 'all';
            localStorage.setItem('lrGourmetMgmtSection', this.currentProductSectionFilter);
            this.renderProductManagement();
        });
        
        // Date filter
        $('#dateFilter').on('change', () => this.updateDashboard());
        
        // Chart controls
        $('.chart-controls .btn').on('click', (e) => this.handleChartControl(e));
        
        // Reports
        $('#generateReport').on('click', (e) => {
            e.preventDefault();
            this.generateReport();
            setTimeout(() => {
                const reportContent = document.getElementById('reportContent');
                if (!reportContent || !reportContent.innerHTML.trim()) {
                    alert('Nenhum dado para gerar o PDF.');
                    return;
                }
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
                doc.setFontSize(14);
                const reportType = $('#reportType').val();
                const titleMap = {
                    sales: 'Relatório de Vendas',
                    products: 'Relatório de Produtos',
                    customers: 'Relatório de Clientes',
                    locations: 'Relatório de Localizações'
                };
                const title = titleMap[reportType] || 'Relatório';
                const now = new Date().toLocaleString('pt-BR');
                doc.text(`${title} - ${now}`, 40, 40);
                const table = reportContent.querySelector('table');
                if (table) {
                    doc.autoTable({ html: table, startY: 60, styles: { fontSize: 9 } });
                } else {
                    doc.text(reportContent.innerText, 40, 80);
                }
                doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
            }, 500);
        });
        $('#exportReport').on('click', () => this.exportReport());

        // Exports PDF
        $('#exportOrders').on('click', () => this.exportTableToPDF('#recentOrdersTable', 'Pedidos_Recentes'));
        $('#exportProducts').on('click', () => this.exportTableToPDF('#productsRankingTable', 'Ranking_Produtos'));
        $('#exportAddresses').on('click', () => this.exportTableToPDF('#addressesTable', 'Enderecos_Clientes'));
        
        // Add Products functionality
        $('#addProductForm').on('submit', (e) => this.handleAddProduct(e));
        $('#clearForm').on('click', () => this.clearAddProductForm());
    // Botão de limpar todos os produtos adicionados removido da UI
        $('#exportProductsList').on('click', () => this.exportAddedProducts());
        // Optional purge button (if present in HTML)
        if ($('#purgeCustomProducts').length) {
            $('#purgeCustomProducts').on('click', () => {
                if (confirm('⚠️ Tem certeza que deseja ZERAR TODOS os produtos do site?\n\nIsso apagará todos os produtos integrados e a disponibilidade. Esta ação não pode ser desfeita.')) {
                    this.purgeCustomProducts();
                    // Resetar filtros de página e seção após limpeza
                    this.currentProductPageFilter = 'index';
                    this.currentProductSectionFilter = 'all';
                    localStorage.setItem('lrGourmetMgmtPage', this.currentProductPageFilter);
                    localStorage.setItem('lrGourmetMgmtSection', this.currentProductSectionFilter);
                    // Ajustar UI dos botões de página
                    $('#productPageFilters .btn').removeClass('active');
                    $('#productPageFilters .btn[data-page="index"]').addClass('active');
                    this.populateSectionFilter();
                    this.renderProductManagement();
                }
            });
        }
        // Horários de funcionamento
        $('#horariosForm').on('submit', (e) => this.handleSaveBusinessHours(e));
        // Carregar horários ao abrir seção
        $('[data-section="horarios"]').on('click', () => this.loadBusinessHoursForm());

        // Preview de imagem: change/remover
        this.pendingImageDataUrl = '';
        $('#productImage').on('change', async (e) => {
            await this.handleImageChange(e);
        });
        $('#removeProductImage').on('click', () => {
            this.removeSelectedImage();
        });
        $('#cropImageBtn').on('click', () => {
            this.openCropperModal();
        });
        // Botão Preview (fallback mobile)
        $('#imageActionsPreviewBtn').on('click', () => {
            // Se não houver imagem pendente mas já existir preview, usar ele
            const currentPreview = $('#productImagePreview').attr('src');
            if (!this.pendingImageDataUrl && currentPreview) {
                this.pendingImageDataUrl = currentPreview;
            }
            this.openCropperModal();
        });
        $('#confirmCropBtn').on('click', async () => {
            await this.applyCropperResult();
        });
        // Excluir imagem pelo modal de corte
        $('#deleteImageInModal').on('click', () => {
            this.removeSelectedImage();
            try { $('#cropImageModal').modal('hide'); } catch {}
        });
    }

    // Renderiza o grid de gerenciamento de disponibilidade de produtos
    renderProductManagement() {
        const $grid = $('#productManagementGrid');
        if ($grid.length === 0) return;

        // Define página atual a partir do botão ativo ou estado salvo
        const activeBtn = $('#productPageFilters .btn.active');
        const page = (activeBtn.data('page') || this.currentProductPageFilter || 'index');
        this.currentProductPageFilter = page;

        let products = this.loadProductsList().filter(p => (p.page || 'index') === page);
        // Aplicar filtro de seção, se houver
        const sectionFilter = this.currentProductSectionFilter || 'all';
        if (sectionFilter !== 'all') {
            products = products.filter(p => (p.section || 'outros') === sectionFilter);
        }
        $grid.empty();

        if (products.length === 0) {
            $grid.append(`
                <div class="col-12">
                    <div class="alert alert-info mb-0">Nenhum produto para esta página ainda. Adicione produtos em "Adicionar Produtos" e selecione a página "${this.formatPageName(page)}".</div>
                </div>
            `);
            return;
        }

        // Agrupa produtos por seção
        const grouped = products.reduce((acc, p) => {
            const sec = p.section || 'outros';
            acc[sec] = acc[sec] || [];
            acc[sec].push(p);
            return acc;
        }, {});
        // Ordena seções por nome amigável
        const sections = Object.keys(grouped).sort((a, b) => this.formatSectionName(a).localeCompare(this.formatSectionName(b)));

        // Renderiza um card para cada seção, com os produtos dentro
        sections.forEach((sec) => {
            const sectionProducts = grouped[sec];
            const sectionTitle = this.formatSectionName(sec);
            // Card da seção
            const sectionId = `section-${sec.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
            $grid.append(`
                <div class="col-12 mb-3">
                    <div class="card shadow-sm">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${sectionTitle}</h6>
                            <span class="badge badge-light">${sectionProducts.length}</span>
                        </div>
                        <div class="card-body">
                            <div class="row" id="${sectionId}"></div>
                        </div>
                    </div>
                </div>
            `);

            // Dentro do card da seção, renderiza os cards individuais de produto
            const $sectionRow = $('#' + sectionId);
            sectionProducts.forEach((p) => {
                const isAvailable = this.isProductAvailable(p.name);
                const toggleId = 'toggle-' + (p.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const category = p.category ? ` • ${p.category}` : '';
                const img = p.image || 'default-product.png';
                // Estoque atual
                const currentStock = this.getCurrentStock(p.name);
                const isUnlimited = (currentStock === null);
                $sectionRow.append(`
                    <div class="col-lg-4 col-md-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column product-card-body" style="position:relative;">
                                <!-- Badge fixado no topo direito (desktop) -->
                                <span class="badge product-status-badge ${isAvailable ? 'badge-success' : 'badge-secondary'}" style="position:absolute; top:8px; right:8px; z-index:1;">${isAvailable ? 'Ativo' : 'Inativo'}</span>

                                <div class="d-flex align-items-center mb-2 product-header">
                                    <img src="${img}" alt="${p.name}" onerror="this.src='default-product.png'" style="width:42px;height:42px;object-fit:cover;border-radius:6px;margin-right:10px;border:1px solid #eee;" />
                                    <div>
                                        <h6 class="mb-1">${p.name}</h6>
                                        <small class="text-muted product-category">${category || '&nbsp;'}</small>
                                    </div>
                                </div>

                                <!-- Toggle à esquerda e preço à direita (desktop); em mobile o toggle vai para o topo direito -->
                                <div class="d-flex align-items-center justify-content-between product-meta">
                                    <div class="custom-control custom-switch product-availability-toggle">
                                        <input type="checkbox" class="custom-control-input product-toggle" id="${toggleId}" data-name="${p.name}" ${isAvailable ? 'checked' : ''}>
                                        <label class="custom-control-label" for="${toggleId}">Disponível</label>
                                    </div>
                                    <strong class="mb-0 product-price">${this.formatCurrency(Number(p.price || 0))}</strong>
                                </div>

                                <!-- Estoque (em mobile fica mais acima e "Ilimitado" embaixo) -->
                                <div class="mt-1 stock-block">
                                    <label class="mb-1" style="font-weight:600;font-size:.9rem;">Estoque</label>
                                    <div class="d-flex align-items-center stock-inline">
                                        <div class="d-flex align-items-center">
                                            <button class="btn btn-sm btn-outline-secondary mr-2 btn-stock-dec" data-name="${p.name}">-</button>
                                            <input type="number" class="form-control form-control-sm stock-input" data-name="${p.name}" style="max-width:120px;text-align:center;" ${isUnlimited ? 'disabled' : ''} value="${isUnlimited ? '' : currentStock}">
                                            <button class="btn btn-sm btn-outline-secondary ml-2 btn-stock-inc" data-name="${p.name}">+</button>
                                        </div>
                                        <div class="form-check ml-3 stock-unlimited-wrapper">
                                            <input class="form-check-input stock-unlimited" type="checkbox" id="unl-${toggleId}" data-name="${p.name}" ${isUnlimited ? 'checked' : ''}>
                                            <label class="form-check-label" for="unl-${toggleId}">Ilimitado</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });
        });

        // Liga eventos dos toggles
        $('.product-toggle').off('change').on('change', (e) => {
            const name = $(e.currentTarget).data('name');
            const checked = e.currentTarget.checked;
            this.setProductAvailability(name, checked);
            // Re-render para atualizar badge de status
            this.renderProductManagement();
        });

        // Eventos de estoque: incrementar/decrementar
        $('.btn-stock-inc').off('click').on('click', (e) => {
            const name = $(e.currentTarget).data('name');
            // Se ilimitado, não faz nada
            const isUnl = $(`.stock-unlimited[data-name="${CSS.escape(name)}"]`).prop('checked');
            if (isUnl) return;
            this.adjustStockValue(name, +1);
        });
        $('.btn-stock-dec').off('click').on('click', (e) => {
            const name = $(e.currentTarget).data('name');
            const isUnl = $(`.stock-unlimited[data-name="${CSS.escape(name)}"]`).prop('checked');
            if (isUnl) return;
            this.adjustStockValue(name, -1);
        });
        // Alteração direta no input
        $('.stock-input').off('change').on('change', (e) => {
            const name = $(e.currentTarget).data('name');
            const val = $(e.currentTarget).val();
            if (val === '' || val === null) {
                // Se limpar o campo, não altera imediatamente; user pode marcar ilimitado
                return;
            }
            this.setStockValue(name, val);
        });
        // Alternância ilimitado
        $('.stock-unlimited').off('change').on('change', (e) => {
            const name = $(e.currentTarget).data('name');
            const checked = e.currentTarget.checked;
            if (checked) {
                this.setStockValue(name, null);
            } else {
                // Se desmarcou ilimitado, e input está vazio, inicia como 0
                const $input = $(`.stock-input[data-name="${CSS.escape(name)}"]`);
                const val = $input.val();
                this.setStockValue(name, (val === '' ? 0 : val));
            }
        });
    }

    // Helper para exibir nomes de página legíveis
    formatPageName(page) {
        const map = { index: 'Página Inicial', cardapio: 'Cardápio', pistache: 'Pistache' };
        return map[page] || page;
    }

    // Reaproveita mapeamento de seção do site público
    formatSectionName(section) {
        const map = {
            'doces': 'Doces',
            'bebidas': 'Bebidas',
            'doces-no-pote': 'Doces no Pote',
            'trufas-ao-leite': 'Trufas ao Leite',
            'trufas-brancas': 'Trufas Brancas',
            'trufas-de-pistache': 'Trufas de Pistache',
            'casquinha-de-pistache': 'Casquinha de Pistache',
            'outros': 'Outros'
        };
        return map[section] || (section ? section.replace(/-/g, ' ') : 'Outros');
    }

    // Popular o dropdown de seções conforme página selecionada
    populateSectionFilter() {
        const $select = $('#productSectionFilter');
        if ($select.length === 0) return;
        const page = this.currentProductPageFilter || 'index';
        const products = this.loadProductsList().filter(p => (p.page || 'index') === page);
        const sectionSet = new Set(products.map(p => p.section || 'outros'));
        const sections = Array.from(sectionSet);
        sections.sort((a, b) => this.formatSectionName(a).localeCompare(this.formatSectionName(b)));
        const current = this.currentProductSectionFilter || 'all';
        $select.empty();
        $select.append('<option value="all">Todas as seções</option>');
        sections.forEach(sec => {
            const option = document.createElement('option');
            option.value = sec;
            option.textContent = this.formatSectionName(sec);
            if (sec === current) option.selected = true;
            $select.append(option);
        });
    }

    // Alterna entre gráficos de receita/pedidos
    handleChartControl(e) {
        e.preventDefault();
        const $btn = $(e.currentTarget);
        const selected = $btn.data('chart'); // 'revenue' | 'orders'
        $btn.closest('.chart-controls').find('.btn').removeClass('active');
        $btn.addClass('active');

        if (this.charts.revenue) {
            const data = selected === 'orders' ? this.generateOrdersChartData() : this.generateRevenueChartData();
            this.charts.revenue.data = data;
            this.charts.revenue.options.scales.y.ticks.callback = (value) => (
                selected === 'orders' ? value : this.formatCurrency(value)
            );
            this.charts.revenue.update();
        }
    }

    // Exporta tabela para PDF usando jsPDF
    exportTableToPDF(tableSelector, title) {
        const table = document.querySelector(tableSelector);
        if (!table) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const now = new Date().toLocaleString('pt-BR');
        doc.setFontSize(14);
        doc.text(`${title} - ${now}`, 40, 40);
        doc.autoTable({ html: table, startY: 60, styles: { fontSize: 9 } });
        doc.save(`${title}.pdf`);
    }

    // Exibe modal de login ao abrir dashboard
    showLoginModal() {
        $('#loginModal').modal('show');
    }

    // Valida login simples (apenas para demonstração)
    handleLogin() {
        const username = $('#username').val();
        const password = $('#password').val();
        
        // Simple authentication (in production, use proper authentication)
        if (username === 'admin' && password === 'lrgourmet2025') {
            this.isAuthenticated = true;
            $('#loginModal').modal('hide');
            this.initializeDashboard();
        } else {
            $('#loginError').removeClass('d-none');
        }
    }

    // Realiza logout e recarrega página
    handleLogout() {
        this.isAuthenticated = false;
        location.reload();
    }

    // Inicializa dashboard após login
    initializeDashboard() {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // Restaurar filtros persistidos do gerenciamento
            const savedPage = localStorage.getItem('lrGourmetMgmtPage');
            const savedSection = localStorage.getItem('lrGourmetMgmtSection');
            if (savedPage) {
                this.currentProductPageFilter = savedPage;
                $('#productPageFilters .btn').removeClass('active');
                const $btn = $(`#productPageFilters .btn[data-page="${savedPage}"]`);
                if ($btn.length) $btn.addClass('active');
            }
            if (savedSection) {
                this.currentProductSectionFilter = savedSection;
            }
            this.updateDashboard();
            this.initializeCharts();
            // Popular filtro de seção após primeira carga
            this.populateSectionFilter();
        }, 100);
    }

    // Carrega dados reais do localStorage ou gera dados de exemplo
    loadRealData() {
        // Carregar dados reais do localStorage
        const orders = JSON.parse(localStorage.getItem('lrGourmetOrders')) || [];
        const customers = JSON.parse(localStorage.getItem('lrGourmetCustomers')) || [];
        
        // Converter strings de data de volta para objetos Date
        orders.forEach(order => {
            order.date = new Date(order.date);
        });
        
        customers.forEach(customer => {
            if (customer.firstOrder) customer.firstOrder = new Date(customer.firstOrder);
            if (customer.lastOrder) customer.lastOrder = new Date(customer.lastOrder);
        });
        
        // Se não há dados reais, usar alguns dados de exemplo
        if (orders.length === 0) {
            return this.generateSampleData();
        }
        
        return { orders, customers };
    }
    
    // Gera dados de exemplo caso não haja dados reais
    generateSampleData() {
        const products = [
            'Bom Bom de Morango', 'Bom Bom de Uva', 'Tortinha de Limão', 
            'Pavê de Prestígio', 'Trufa de Nutella', 'Refrigerante Coca-Lata',
            'Água Mineral', 'Brigadeiro', 'Trufa Tradicional'
        ];
        
        const bairros = [
            'Centro', 'Vila Industrial', 'Jardim América', 'Vila Nova', 
            'Jardim Parati', 'Vila São José', 'Jardim Orlando'
        ];
        
        const customers = [
            'Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira',
            'Carla Souza', 'Roberto Lima', 'Fernanda Alves'
        ];

        // Generate sample orders data
        const orders = [];
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            const items = [];
            const numItems = Math.floor(Math.random() * 3) + 1;
            let subtotal = 0;
            
            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = Math.random() * 10 + 5;
                items.push({ product, quantity, price });
                subtotal += quantity * price;
            }
            
            orders.push({
                id: `#${Date.now() + i}`,
                customer: customers[Math.floor(Math.random() * customers.length)],
                items,
                subtotal: subtotal,
                deliveryFee: 10,
                total: subtotal + 10,
                payment: ['PIX', 'Cartão', 'Dinheiro'][Math.floor(Math.random() * 3)],
                status: 'PENDENTE', // Sempre inicia como PENDENTE (aguardando ação)
                date,
                bairro: bairros[Math.floor(Math.random() * bairros.length)]
            });
        }

        return { orders, customers: [] };
    }

    // Product management methods
    // ===============================
    // MÉTODOS DE PRODUTOS
    // ===============================
    // Carrega lista de produtos padrão + customizados
    loadProductsList() {
        // Sem produtos padrão: o sistema inicia vazio e usa apenas os integrados via dashboard
        // Carregar produtos integrados (adicionados pelo dashboard)
        const integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        const allProducts = [];
        const sectionToCategory = {
            'doces': 'Doces',
            'bebidas': 'Bebidas',
            'doces-no-pote': 'Doce no Pote',
            'trufas-ao-leite': 'Trufa ao Leite',
            'trufas-brancas': 'Trufa Branca',
            'trufas-de-pistache': 'Trufas de Pistache',
            'casquinha-de-pistache': 'Casquinha de Pistache'
        };
        integratedProducts.forEach(function(customProduct) {
            allProducts.push({
                name: customProduct.name,
                category: customProduct.category || sectionToCategory[customProduct.section] || 'Outros',
                price: customProduct.price,
                description: customProduct.description,
                image: customProduct.image,
                isCustom: true,
                page: customProduct.page,
                section: customProduct.section
            });
        });

        // Aplicar overrides salvos (sistema de edição de produtos padrão)
        const overrides = JSON.parse(localStorage.getItem('lrGourmetProductOverrides')) || {};
        
        return allProducts.map(product => {
            const override = overrides[product.name];
            return override ? { ...product, ...override } : product;
        });
    }

    // Retorna disponibilidade dos produtos
    getProductAvailability() {
        return JSON.parse(localStorage.getItem('lrGourmetProductAvailability')) || {};
    }

    // Define disponibilidade de um produto
    setProductAvailability(productName, isAvailable) {
        const availability = this.getProductAvailability();
        availability[productName] = isAvailable;
        localStorage.setItem('lrGourmetProductAvailability', JSON.stringify(availability));
        this.updateProductDisplay();
    }

    // Verifica se produto está disponível
    isProductAvailable(productName) {
        const availability = this.getProductAvailability();
        return availability[productName] !== false; // Por padrão, produtos são disponíveis
    }

    // ===== ESTOQUE: Helpers de gerenciamento (compartilhado com site público) =====
    getIntegratedProducts() {
        return JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
    }

    getInitialStockForProduct(name) {
        const list = this.getIntegratedProducts();
        const p = list.find(pr => pr && pr.name === name);
        if (!p) return null; // desconhecido => ilimitado
        if (p.stock === null || p.stock === undefined || p.stock === '') return null;
        const n = parseInt(p.stock, 10);
        return isNaN(n) ? null : Math.max(0, n);
    }

    getProductStockState() {
        return JSON.parse(localStorage.getItem('lrGourmetProductStockState')) || {};
    }

    saveProductStockState(state) {
        localStorage.setItem('lrGourmetProductStockState', JSON.stringify(state));
    }

    ensureStockInitialized(name) {
        const state = this.getProductStockState();
        if (!Object.prototype.hasOwnProperty.call(state, name)) {
            const initial = this.getInitialStockForProduct(name);
            state[name] = (initial === null ? null : Number(initial));
            this.saveProductStockState(state);
        }
    }

    getCurrentStock(name) {
        this.ensureStockInitialized(name);
        const state = this.getProductStockState();
        return state[name]; // null = ilimitado
    }

    setStockValue(name, valueOrNull) {
        this.ensureStockInitialized(name);
        const state = this.getProductStockState();
        if (valueOrNull === null || valueOrNull === '') {
            state[name] = null;
        } else {
            const n = parseInt(valueOrNull, 10);
            state[name] = isNaN(n) ? 0 : Math.max(0, n);
        }
        this.saveProductStockState(state);
        // Atualiza UI local
        this.renderProductManagement();
    }

    adjustStockValue(name, delta) {
        this.ensureStockInitialized(name);
        const state = this.getProductStockState();
        if (state[name] === null) {
            // Ilimitado: não ajusta
            return;
        }
        const current = Number(state[name]) || 0;
        state[name] = Math.max(0, current + Number(delta));
        this.saveProductStockState(state);
        this.renderProductManagement();
    }
    // Ativa todos os produtos
    enableAllProducts() {
        const products = this.loadProductsList();
        products.forEach(product => {
            this.setProductAvailability(product.name, true);
        });
        this.renderProductManagement();
        this.updateProductsTable();
    }

    // Desativa todos os produtos
    disableAllProducts() {
        if (confirm('⚠️ Tem certeza que deseja desativar TODOS os produtos?\n\nIsso tornará todos os produtos indisponíveis para os clientes.')) {
            const products = this.loadProductsList();
            products.forEach((product) => {
                this.setProductAvailability(product.name, false);
            });
            this.renderProductManagement();
            this.updateProductsTable();
        }
    }

    // Atualiza exibição dos produtos no site principal
    updateProductDisplay() {
        // Esta função será chamada para atualizar a exibição no site principal
        // Por enquanto, apenas salva no localStorage para ser lida pelo script.js
        const event = new CustomEvent('productAvailabilityChanged', {
            detail: { availability: this.getProductAvailability() }
        });
        window.dispatchEvent(event);
    }

    // Atualiza KPIs, tabelas e gráficos do dashboard
    updateDashboard() {
        const period = $('#dateFilter').val();
        const filteredData = this.filterDataByPeriod(period);
        this.updateKPIs(filteredData);
        this.updateTables(filteredData);
        this.updateCharts(filteredData);
        // Renderizar gerenciamento de produtos se estiver na seção de produtos
        if ($('#products-section').hasClass('active')) {
            this.renderProductManagement();
            this.updateProductsTable(filteredData);
        }
    }

    // Observa alterações em pedidos para atualizar ranking de bairros em tempo real
    observeOrdersForRanking() {
        // Observa mudanças no localStorage dos pedidos
        window.addEventListener('storage', (event) => {
            if (event.key === 'lrGourmetOrders') {
                // Atualiza dashboard e ranking de bairros
                this.realData = this.loadRealData();
                this.updateDashboard();
            }
        });
    }

    // Filtra dados de pedidos pelo período selecionado
    filterDataByPeriod(period) {
        const now = new Date();
        let startDate = new Date();
        
        switch(period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        return this.realData.orders.filter(order => order.date >= startDate);
    }

    // Atualiza KPIs principais do dashboard
    updateKPIs(data) {
        const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = data.length;
        const totalProducts = data.reduce((sum, order) => 
            sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        $('#totalRevenue').text(this.formatCurrency(totalRevenue));
        $('#totalOrders').text(totalOrders);
        $('#totalProducts').text(totalProducts);
        $('#avgOrderValue').text(this.formatCurrency(avgOrderValue));
        
        // Calcular crescimento comparando com período anterior
        const growth = this.calculateGrowth(data);
        $('#revenueGrowth').text(growth.revenue);
        $('#ordersGrowth').text(growth.orders);
        $('#productsGrowth').text(growth.products);
        $('#avgOrderGrowth').text(growth.avgOrder);
        
        // Atualizar KPIs da seção de clientes
        const uniqueCustomers = new Set(data.map(order => order.customer)).size;
        const newCustomers = this.calculateNewCustomers(data);
        const returningCustomers = uniqueCustomers - newCustomers;
        
        $('#totalCustomers').text(uniqueCustomers);
        $('#newCustomers').text(newCustomers);
        $('#returningCustomers').text(returningCustomers);
    }
    
    // Calcula crescimento dos KPIs (simulado)
    calculateGrowth(currentData) {
        // Simular cálculo de crescimento baseado nos dados reais
        const hasData = currentData.length > 0;
        return {
            revenue: hasData ? '+' + (Math.random() * 20 + 5).toFixed(1) + '%' : '0%',
            orders: hasData ? '+' + (Math.random() * 15 + 3).toFixed(1) + '%' : '0%',
            products: hasData ? '+' + (Math.random() * 25 + 8).toFixed(1) + '%' : '0%',
            avgOrder: hasData ? '+' + (Math.random() * 10 + 2).toFixed(1) + '%' : '0%'
        };
    }
    
    // Calcula número de novos clientes
    calculateNewCustomers(data) {
        const savedCustomers = this.realData.customers || [];
        const currentCustomers = new Set(data.map(order => order.customer));
        
        let newCount = 0;
        currentCustomers.forEach(customerName => {
            const existing = savedCustomers.find(c => c.name === customerName);
            if (!existing || this.isNewCustomer(existing)) {
                newCount++;
            }
        });
        
        return newCount;
    }
    
    // Verifica se cliente é novo (últimos 30 dias)
    isNewCustomer(customer) {
        if (!customer.firstOrder) return true;
        const firstOrder = new Date(customer.firstOrder);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return firstOrder >= thirtyDaysAgo;
    }

    // Atualiza todos os gráficos do dashboard
    updateCharts(filteredData) {
        // Atualizar gráficos com dados reais
        if (this.charts.revenue) {
            const selected = $('.chart-controls .btn.active').data('chart') || 'revenue';
            this.charts.revenue.data = selected === 'orders' ? this.generateOrdersChartData() : this.generateRevenueChartData();
            this.charts.revenue.options.scales.y.ticks.callback = (value) => (
                selected === 'orders' ? value : this.formatCurrency(value)
            );
            this.charts.revenue.update();
        }
        
        if (this.charts.payment) {
            this.charts.payment.data = this.generatePaymentChartData();
            this.charts.payment.update();
        }
        
        if (this.charts.topProducts) {
            this.charts.topProducts.data = this.generateTopProductsData();
            this.charts.topProducts.update();
        }
        
        if (this.charts.lowProducts) {
            this.charts.lowProducts.data = this.generateLowProductsData();
            this.charts.lowProducts.update();
        }
        
        if (this.charts.customerSpending) {
            this.charts.customerSpending.data = this.generateCustomerSpendingData();
            this.charts.customerSpending.update();
        }
        
        if (this.charts.spendingDistribution) {
            this.charts.spendingDistribution.data = this.generateSpendingDistributionData();
            this.charts.spendingDistribution.update();
        }
        
        if (this.charts.location) {
            this.charts.location.data = this.generateLocationData();
            this.charts.location.update();
        }
        
        if (this.charts.regionDistribution) {
            this.charts.regionDistribution.data = this.generateRegionDistributionData();
            this.charts.regionDistribution.update();
        }
    }

    // Inicializa todos os gráficos do dashboard
    initializeCharts() {
        this.createRevenueChart();
        this.createPaymentChart();
        this.createTopProductsChart();
        this.createLowProductsChart();
        this.createCustomerSpendingChart();
        this.createSpendingDistributionChart();
        this.createLocationChart();
        this.createRegionDistributionChart();
    }

    // Cria gráfico de receita por período
    createRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) {
            console.error('Canvas revenueChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateRevenueChartData();
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    // Cria gráfico de formas de pagamento
    createPaymentChart() {
        const canvas = document.getElementById('paymentChart');
        if (!canvas) {
            console.error('Canvas paymentChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generatePaymentChartData();
        
        this.charts.payment = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Cria gráfico de produtos mais vendidos
    createTopProductsChart() {
        const canvas = document.getElementById('topProductsChart');
        if (!canvas) {
            console.error('Canvas topProductsChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateTopProductsData();
        
        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Cria gráfico de produtos menos vendidos
    createLowProductsChart() {
        const canvas = document.getElementById('lowProductsChart');
        if (!canvas) {
            console.error('Canvas lowProductsChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateLowProductsData();
        
        this.charts.lowProducts = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Cria gráfico de gastos dos clientes
    createCustomerSpendingChart() {
        const canvas = document.getElementById('customerSpendingChart');
        if (!canvas) {
            console.error('Canvas customerSpendingChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateCustomerSpendingData();
        
        this.charts.customerSpending = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    // Cria gráfico de distribuição de gastos
    createSpendingDistributionChart() {
        const canvas = document.getElementById('spendingDistributionChart');
        if (!canvas) {
            console.error('Canvas spendingDistributionChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateSpendingDistributionData();
        
        this.charts.spendingDistribution = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Cria gráfico de pedidos por bairro
    createLocationChart() {
        const canvas = document.getElementById('locationChart');
        if (!canvas) {
            console.error('Canvas locationChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateLocationData();
        
        this.charts.location = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Cria gráfico de distribuição por região
    createRegionDistributionChart() {
        const canvas = document.getElementById('regionDistributionChart');
        if (!canvas) {
            console.error('Canvas regionDistributionChart não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const data = this.generateRegionDistributionData();
        
        this.charts.regionDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Data generation methods
    // ===============================
    // MÉTODOS DE GERAÇÃO DE DADOS PARA GRÁFICOS
    // ===============================
    generateRevenueChartData() {
        const period = $('#dateFilter').val();
        const filteredData = this.filterDataByPeriod(period);
        
        // Agrupar dados por data
        const dailyRevenue = {};
        filteredData.forEach(order => {
            const dateKey = order.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!dailyRevenue[dateKey]) {
                dailyRevenue[dateKey] = 0;
            }
            dailyRevenue[dateKey] += order.total;
        });
        
        const labels = Object.keys(dailyRevenue).sort();
        const data = labels.map(label => dailyRevenue[label]);
        
        return {
            labels,
            datasets: [{
                label: 'Receita',
                data,
                borderColor: '#2e8291',
                backgroundColor: 'rgba(46, 130, 145, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }

    generatePaymentChartData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const paymentStats = {};
        
        filteredData.forEach(order => {
            if (!paymentStats[order.payment]) {
                paymentStats[order.payment] = 0;
            }
            paymentStats[order.payment]++;
        });
        
        const labels = Object.keys(paymentStats);
        const data = Object.values(paymentStats);
        const colors = ['#28a745', '#17a2b8', '#ffc107', '#dc3545'];
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length)
            }]
        };
    }

    generateOrdersChartData() {
        const period = $('#dateFilter').val();
        const filteredData = this.filterDataByPeriod(period);
        const dailyOrders = {};
        filteredData.forEach(order => {
            const dateKey = order.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            dailyOrders[dateKey] = (dailyOrders[dateKey] || 0) + 1;
        });
        const labels = Object.keys(dailyOrders).sort();
        const data = labels.map(label => dailyOrders[label]);
        return {
            labels,
            datasets: [{
                label: 'Pedidos',
                data,
                borderColor: '#2e8291',
                backgroundColor: 'rgba(46, 130, 145, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }

    generateTopProductsData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const productStats = {};
        
        filteredData.forEach(order => {
            order.items.forEach(item => {
                const productName = item.product || item.name;
                if (!productStats[productName]) {
                    productStats[productName] = 0;
                }
                productStats[productName] += item.quantity;
            });
        });
        
        const sorted = Object.entries(productStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const labels = sorted.map(([product]) => product);
        const data = sorted.map(([,quantity]) => quantity);
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: '#28a745'
            }]
        };
    }

    generateLowProductsData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const productStats = {};
        
        filteredData.forEach(order => {
            order.items.forEach(item => {
                const productName = item.product || item.name;
                if (!productStats[productName]) {
                    productStats[productName] = 0;
                }
                productStats[productName] += item.quantity;
            });
        });
        
        const sorted = Object.entries(productStats)
            .sort(([,a], [,b]) => a - b)
            .slice(0, 5);
        
        const labels = sorted.map(([product]) => product);
        const data = sorted.map(([,quantity]) => quantity);
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: '#dc3545'
            }]
        };
    }

    generateCustomerSpendingData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const monthlySpending = {};
        
        filteredData.forEach(order => {
            const monthKey = order.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (!monthlySpending[monthKey]) {
                monthlySpending[monthKey] = 0;
            }
            monthlySpending[monthKey] += order.total;
        });
        
        const labels = Object.keys(monthlySpending).sort();
        const data = labels.map(label => monthlySpending[label]);
        
        return {
            labels,
            datasets: [{
                label: 'Gastos dos Clientes',
                data,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }

    generateSpendingDistributionData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const ranges = {
            'R$ 0-50': 0,
            'R$ 51-100': 0,
            'R$ 101-200': 0,
            'R$ 201+': 0
        };
        
        filteredData.forEach(order => {
            if (order.total <= 50) {
                ranges['R$ 0-50']++;
            } else if (order.total <= 100) {
                ranges['R$ 51-100']++;
            } else if (order.total <= 200) {
                ranges['R$ 101-200']++;
            } else {
                ranges['R$ 201+']++;
            }
        });
        
        return {
            labels: Object.keys(ranges),
            datasets: [{
                data: Object.values(ranges),
                backgroundColor: ['#ffc107', '#28a745', '#17a2b8', '#dc3545']
            }]
        };
    }

    generateLocationData() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const locationStats = {};
        
        filteredData.forEach(order => {
            if (!locationStats[order.bairro]) {
                locationStats[order.bairro] = 0;
            }
            locationStats[order.bairro]++;
        });
        
        const sorted = Object.entries(locationStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
        
        const labels = sorted.map(([bairro]) => bairro);
        const data = sorted.map(([,count]) => count);
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: '#2e8291'
            }]
        };
    }

    generateRegionDistributionData() {
        return {
            labels: ['Centro', 'Norte', 'Sul', 'Leste', 'Oeste'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: ['#2e8291', '#28a745', '#17a2b8', '#ffc107', '#dc3545']
            }]
        };
    }

    // ===============================
    // MÉTODOS DE TABELAS
    // ===============================
    updateTables(data) {
        this.updateRecentOrdersTable(data);
        this.updateProductsTable(data);
        this.updateTopCustomersTable(data);
        this.updateLocationTable();
    }

    // Atualiza tabela de pedidos recentes
    updateRecentOrdersTable(data) {
        const tbody = $('#recentOrdersTable tbody');
        tbody.empty();
        
        const recent = data.slice(-10).reverse();
        recent.forEach(order => {
            // Define classes de cor para cada status
            let statusStyle = '';
            if (order.status === 'CANCELADO') {
                statusStyle = 'background-color:#dc3545;color:#fff;font-weight:bold;'; // Vermelho/branco
            } else if (order.status === 'FINALIZADO') {
                statusStyle = 'background-color:#28a745;color:#222;font-weight:bold;'; // Verde/preto
            } else {
                statusStyle = 'background-color:#007bff;color:#222;font-weight:bold;'; // Azul/preto
            }
            tbody.append(`
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.items.length} itens</td>
                    <td>${this.formatCurrency(order.total)}</td>
                    <td>${order.payment}</td>
                    <td>
                        <select class="form-control form-control-sm order-status-selector" data-order-id="${order.id}" style="${statusStyle}">
                            <option value="PENDENTE" style="background-color:#007bff;color:#222;" ${order.status === 'PENDENTE' ? 'selected' : ''}>PENDENTE</option>
                            <option value="FINALIZADO" style="background-color:#28a745;color:#222;" ${order.status === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
                            <option value="CANCELADO" style="background-color:#dc3545;color:#fff;" ${order.status === 'CANCELADO' ? 'selected' : ''}>CANCELADO</option>
                        </select>
                    </td>
                    <td>${order.date.toLocaleDateString('pt-BR')}</td>
                </tr>
            `);
        });
        // Evento para alterar status do pedido
        $('.order-status-selector').off('change').on('change', function() {
            // Ao alterar, salva o novo status no localStorage e atualiza a tabela
            const orderId = $(this).data('order-id');
            const newStatus = $(this).val();
            let orders = JSON.parse(localStorage.getItem('lrGourmetOrders')) || [];
            orders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            localStorage.setItem('lrGourmetOrders', JSON.stringify(orders));
            // Atualiza dashboard para refletir a cor e status
            dashboardManager.realData = dashboardManager.loadRealData();
            dashboardManager.updateDashboard();
        });
        /*
        Comentário explicativo:
        - O seletor de status permite alterar o status do pedido diretamente na tabela.
        - Cada status tem uma cor visual distinta:
            CANCELADO: fundo vermelho, texto branco (alerta de cancelamento)
            FINALIZADO: fundo verde, texto preto (pedido concluído)
            PENDENTE: fundo azul, texto preto (aguardando ação)
        - Ao mudar o status, o valor é salvo no localStorage e a tabela é atualizada automaticamente.
        - Isso facilita o acompanhamento e gestão dos pedidos diretamente pelo dashboard.
        */
    }

    // Atualiza tabela de ranking de produtos
    updateProductsTable(data) {
        // Permitir chamada sem parâmetro (atual) usando período selecionado
        if (!data) {
            data = this.filterDataByPeriod($('#dateFilter').val());
        }
        const productStats = {};
        
        data.forEach(order => {
            order.items.forEach(item => {
                const productName = item.product || item.name;
                if (!productStats[productName]) {
                    productStats[productName] = { quantity: 0, revenue: 0 };
                }
                productStats[productName].quantity += item.quantity;
                productStats[productName].revenue += item.quantity * item.price;
            });
        });
        
        const availability = JSON.parse(localStorage.getItem('lrGourmetProductAvailability')) || {};
        const sorted = Object.entries(productStats).sort(([,a], [,b]) => b.quantity - a.quantity);
        const tbody = $('#productsTableBody');
        tbody.empty();
        
        if (sorted.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-center text-muted">Nenhum produto vendido no período selecionado</td></tr>');
            return;
        }
        
        sorted.forEach(([product, stats], index) => {
            const isAvailable = availability[product] !== false;
            const statusBadge = isAvailable ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-secondary">Inativo</span>';
            const growth = '+' + (Math.random() * 20).toFixed(1) + '%';
            tbody.append(
                '<tr>' +
                `<td>${index + 1}º</td>` +
                `<td>${product}</td>` +
                `<td>${statusBadge}</td>` +
                `<td>${stats.quantity}</td>` +
                `<td>${this.formatCurrency(stats.revenue)}</td>` +
                `<td>${growth}</td>` +
                '</tr>'
            );
        });
    }

    // Atualiza tabela de top clientes
    updateTopCustomersTable(data) {
        // Usar dados dos clientes salvos se disponível
        const savedCustomers = this.realData.customers || [];
        const customerStats = {};
        
        // Primeiro, carregar dados salvos dos clientes
        savedCustomers.forEach(customer => {
            customerStats[customer.name] = {
                total: customer.totalSpent || 0,
                orders: customer.totalOrders || 0,
                lastOrder: customer.lastOrder || new Date(),
                bairro: customer.bairro || 'N/A'
            };
        });
        
        // Depois, processar pedidos do período filtrado
        data.forEach(order => {
            if (!customerStats[order.customer]) {
                customerStats[order.customer] = {
                    total: 0,
                    orders: 0,
                    lastOrder: order.date,
                    bairro: order.bairro
                };
            }
            // Para o período filtrado, somar apenas os pedidos desse período
            customerStats[order.customer].total += order.total;
            customerStats[order.customer].orders += 1;
            if (order.date > customerStats[order.customer].lastOrder) {
                customerStats[order.customer].lastOrder = order.date;
            }
        });
        
        const sorted = Object.entries(customerStats)
            .filter(([,stats]) => stats.total > 0)
            .sort(([,a], [,b]) => b.total - a.total);
        
        const tbody = $('#topCustomersTable tbody');
        tbody.empty();
        
        if (sorted.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="7" class="text-center text-muted">Nenhum cliente encontrado no período selecionado</td>
                </tr>
            `);
            return;
        }
        
        sorted.slice(0, 10).forEach(([customer, stats], index) => {
            const avgTicket = stats.total / stats.orders;
            
            tbody.append(`
                <tr>
                    <td>${index + 1}º</td>
                    <td>${customer}</td>
                    <td>${this.formatCurrency(stats.total)}</td>
                    <td>${stats.orders}</td>
                    <td>${this.formatCurrency(avgTicket)}</td>
                    <td>${stats.lastOrder.toLocaleDateString('pt-BR')}</td>
                    <td>${stats.bairro}</td>
                </tr>
            `);
        });
    }

    // Atualiza tabela de análise por localização usando API ViaCEP para obter bairro real
    async updateLocationTable() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const locationStats = {};

        // Função para buscar bairro real via API do ViaCEP
        async function getBairroByCep(cep) {
            try {
                const cepLimpo = cep.replace(/\D/g, '');
                if (cepLimpo.length !== 8) return null;
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json();
                if (data.erro) return null;
                return data.bairro || null;
            } catch {
                return null;
            }
        }

        // Monta ranking usando CEP real
        for (const order of filteredData) {
            let bairro = order.bairro;
            if (order.cep) {
                const bairroReal = await getBairroByCep(order.cep);
                if (bairroReal) bairro = bairroReal;
            }
            if (!locationStats[bairro]) {
                locationStats[bairro] = {
                    orders: 0,
                    revenue: 0
                };
            }
            locationStats[bairro].orders++;
            locationStats[bairro].revenue += order.total;
        }

        const totalOrders = filteredData.length;
        const tbody = $('#locationsTable tbody');
        tbody.empty();

        Object.entries(locationStats)
            .sort(([,a], [,b]) => b.orders - a.orders)
            .forEach(([bairro, stats]) => {
                const avgTicket = stats.revenue / stats.orders;
                const percentage = ((stats.orders / totalOrders) * 100).toFixed(1);
                tbody.append(`
                    <tr>
                        <td>${bairro}</td>
                        <td>${stats.orders}</td>
                        <td>${this.formatCurrency(stats.revenue)}</td>
                        <td>${this.formatCurrency(avgTicket)}</td>
                        <td>${percentage}%</td>
                        <td>R$ 10,00</td>
                    </tr>
                `);
            });
    }

    // Atualiza aba de endereços e KPIs relacionados
    updateAddressesTab() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        
        // Agrupar dados por cliente e endereço
        const addressData = {};
        const uniqueAddresses = new Set();
        const uniqueCeps = new Set();
        let totalDeliveryFees = 0;
        let deliveryCount = 0;
        
        filteredData.forEach(order => {
            const key = `${order.customer}-${order.address}`;
            
            if (!addressData[key]) {
                addressData[key] = {
                    customer: order.customer,
                    address: order.address,
                    cep: order.cep || 'N/A',
                    bairro: order.bairro,
                    orders: 0,
                    lastOrder: order.date,
                    deliveryFee: order.deliveryFee || 10
                };
            }
            
            addressData[key].orders++;
            if (order.date > addressData[key].lastOrder) {
                addressData[key].lastOrder = order.date;
            }
            
            uniqueAddresses.add(order.address);
            if (order.cep) uniqueCeps.add(order.cep);
            totalDeliveryFees += order.deliveryFee || 10;
            deliveryCount++;
        });
        
        // Atualizar KPIs
        $('#totalAddresses').text(uniqueAddresses.size);
        $('#totalCeps').text(uniqueCeps.size);
        $('#avgDeliveryFee').text(this.formatCurrency(totalDeliveryFees / deliveryCount || 0));
        
        // Calcular clientes recorrentes (mais de 1 pedido)
        const repeatCustomers = Object.values(addressData).filter(addr => addr.orders > 1).length;
        $('#repeatCustomers').text(repeatCustomers);
        
        // Preencher tabela de endereços
        const tbody = $('#addressesTable tbody');
        tbody.empty();
        
        Object.values(addressData)
            .sort((a, b) => b.orders - a.orders)
            .forEach(addr => {
                const row = '<tr>' +
                    '<td><strong>' + addr.customer + '</strong></td>' +
                    '<td>' + addr.address + '</td>' +
                    '<td>' + addr.cep + '</td>' +
                    '<td><span class="badge badge-info">' + addr.bairro + '</span></td>' +
                    '<td><span class="badge badge-primary">' + addr.orders + '</span></td>' +
                    '<td>' + addr.lastOrder.toLocaleDateString('pt-BR') + '</td>' +
                    '<td>' + this.formatCurrency(addr.deliveryFee) + '</td>' +
                    '</tr>';
                tbody.append(row);
            });
    }

    // ===============================
    // NAVEGAÇÃO ENTRE SEÇÕES
    // ===============================
    handleNavigation(e) {
        e.preventDefault();
        const target = $(e.target).data('section');
        
        // Update active nav
        $('.nav-link').removeClass('active');
        $(e.target).addClass('active');
        
        // Update active section
        $('.content-section').removeClass('active');
        $(`#${target}-section`).addClass('active');
        
        // Load specific data for each section
        if (target === 'add-products') {
            this.updateAddedProductsTable();
        }
        
        // Renderizar gerenciamento de produtos quando navegar para produtos
        if (target === 'products') {
            this.renderProductManagement();
            // Reposicionar botões ao entrar na seção
            this.updateProductActionsPlacement();
        }
        // Renderizar precificação quando navegar para precificacao
        if (target === 'precificacao') {
            $('#precificacao-section').show();
            this.initPrecificacao();
        } else {
            $('#precificacao-section').hide();
        }
        
        // Atualizar aba de endereços quando navegar para locations
        if (target === 'locations') {
            this.updateAddressesTab();
        }
    }

    // ===============================
    // RESPONSIVIDADE DOS BOTÕES DE AÇÕES (Produtos)
    // ===============================
    setupResponsiveProductActions() {
        // Atualiza ao carregar e ao redimensionar
        this.updateProductActionsPlacement();
        $(window).on('resize', () => this.updateProductActionsPlacement());
    }

    updateProductActionsPlacement() {
        // Move o container de ações para cima dos filtros quando < 1300px
        const $container = $('#productActionsContainer');
        const $mobileMount = $('#productActionsMobileMount');
        const $headerMount = $('#productActionsHeaderMount');
        if ($container.length === 0 || ($mobileMount.length === 0 && $headerMount.length === 0)) return;
        const width = window.innerWidth || document.documentElement.clientWidth;
        if (width < 1300) {
            if (!$mobileMount.has($container).length) {
                $mobileMount.removeClass('d-none');
                $mobileMount.prepend($container);
            }
        } else {
            if (!$headerMount.has($container).length) {
                $headerMount.append($container);
                $mobileMount.addClass('d-none');
            }
        }
    }

    // Alterna exibição da sidebar no mobile
    toggleSidebar() {
        $('.sidebar').toggleClass('show');
        $('#mobileOverlay').toggleClass('show');
        $('body').toggleClass('sidebar-open');
    }

    // Fecha sidebar no mobile
    closeSidebar() {
        $('.sidebar').removeClass('show');
        $('#mobileOverlay').removeClass('show');
        $('body').removeClass('sidebar-open');
    }

    // Atualiza dados do dashboard (recarrega do localStorage)
    refreshData() {
        $('#refreshData').find('i').addClass('fa-spin');
        
        setTimeout(() => {
            this.realData = this.loadRealData();
            this.updateDashboard();
            this.updateCharts(this.filterDataByPeriod($('#dateFilter').val()));
            this.updateAddressesTab();
            $('#refreshData').find('i').removeClass('fa-spin');
        }, 1000);
    }

    // Limpa todos os dados do dashboard (pedidos, clientes, histórico)
    clearAllData() {
        if (confirm('⚠️ ATENÇÃO!\n\nEsta ação irá apagar TODOS os dados de:\n• Pedidos\n• Clientes\n• Histórico de vendas\n\nEsta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
            // Limpar todos os dados do localStorage
            localStorage.removeItem('lrGourmetOrders');
            localStorage.removeItem('lrGourmetCustomers');
            localStorage.removeItem('lancheriaCart');
            
            // Recarregar dados
            this.realData = this.loadRealData();
            this.updateDashboard();
            this.updateCharts(this.filterDataByPeriod($('#dateFilter').val()));
            this.updateAddressesTab();
            
            // Mostrar confirmação
            alert('✅ Todos os dados foram apagados com sucesso!');
        }
    }

    // ===== PRODUCT MANAGEMENT METHODS =====
    
    // ===============================
    // MÉTODOS DE ADIÇÃO/REMOÇÃO DE PRODUTOS CUSTOMIZADOS
    // ===============================
    async handleAddProduct(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('productImage');
        const file = fileInput.files[0];
        let imageDataUrl = 'default-product.png';
        
        // Se um arquivo foi selecionado, usar o nome do arquivo
        if (file) {
            // Validar tipo de arquivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('Por favor, selecione apenas arquivos de imagem (JPG, PNG, SVG, WebP).');
                return;
            }
            
            // Validar tamanho do arquivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('O arquivo deve ter no máximo 5MB.');
                return;
            }
            try {
                // Se já temos preview pendente (processado), reaproveitar
                if (this.pendingImageDataUrl) {
                    imageDataUrl = this.pendingImageDataUrl;
                } else {
                    imageDataUrl = await this.processImageFile(file);
                }
            } catch (err) {
                console.error('Falha ao processar imagem:', err);
                alert('Não foi possível processar a imagem. Tente outro arquivo.');
                return;
            }
        } else if (this.pendingImageDataUrl) {
            // Caso o input tenha sido limpo, mas o preview permaneceu
            imageDataUrl = this.pendingImageDataUrl;
        }
        
        // NOVO: capturar página e seção
        const page = $('#productPage').val();
        const section = $('#productSection').val();
        const productData = {
            name: $('#productName').val().trim(),
            price: parseFloat($('#productPrice').val()),
            stock: (function(){
                const v = $('#productStock').val();
                if (v === '' || v === null || v === undefined) return null; // estoque ilimitado
                const n = parseInt(v, 10);
                return isNaN(n) ? null : Math.max(0, n);
            })(),
            page: page,
            section: section,
            category: this.getCategoryFromSection(section),
            description: $('#productDescription').val().trim(),
            image: imageDataUrl,
            id: Date.now().toString(),
            isCustom: true,
            isAvailable: true
        };
        // Validação básica
        if (!productData.name || !productData.price || !productData.page || !productData.section || !productData.description) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (productData.price <= 0) {
            alert('O preço deve ser maior que zero.');
            return;
        }
        // Salvar produto
        this.saveProduct(productData);
        this.updateAddedProductsTable();
        this.clearAddProductForm();
    this.clearImagePreview();
        // Disparar evento para atualizar páginas públicas
        this.notifyProductUpdate();
        // Atualizar grid de gerenciamento caso usuário abra a aba Produtos depois
        this.renderProductManagement();
        alert('✅ Produto adicionado com sucesso! Ele já está disponível na página e seção selecionada.');
    }
    
    // Salva produto customizado no sistema
    saveProduct(productData) {
    // Salvar no sistema de produtos customizados
    let customProducts = JSON.parse(localStorage.getItem('lrGourmetAddedProducts')) || [];
    customProducts.push(productData);
    localStorage.setItem('lrGourmetAddedProducts', JSON.stringify(customProducts));
    // Integrar com o sistema principal de produtos
    this.integrateProductIntoMainSystem(productData);
    }

    // Mapeia seção em uma categoria amigável
    getCategoryFromSection(section) {
        const map = {
            'doces': 'Doces',
            'bebidas': 'Bebidas',
            'doces-no-pote': 'Doce no Pote',
            'trufas-ao-leite': 'Trufa ao Leite',
            'trufas-brancas': 'Trufa Branca',
            'trufas-de-pistache': 'Trufas de Pistache',
            'casquinha-de-pistache': 'Casquinha de Pistache'
        };
        return map[section] || 'Outros';
    }
    
    // Integra produto customizado ao sistema principal
    integrateProductIntoMainSystem(productData) {
        // Carregar produtos integrados existentes
        let integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        
        // Adicionar novo produto ao sistema integrado
        const integratedProduct = {
            id: productData.id,
            name: productData.name,
            price: Number(productData.price),
            stock: (productData.stock === null ? null : Number(productData.stock)),
            page: productData.page,
            section: productData.section,
            description: productData.description || '',
            image: productData.image || 'default-product.png',
            isCustom: true,
            isAvailable: true
        };
        integratedProducts.push(integratedProduct);
        // Salvar produtos integrados
        localStorage.setItem('lrGourmetIntegratedProducts', JSON.stringify(integratedProducts));
        localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());
        // Atualizar disponibilidade do produto
        const availability = this.getProductAvailability();
        availability[productData.name] = true;
        localStorage.setItem('lrGourmetProductAvailability', JSON.stringify(availability));
        // Disparar evento para atualização em outras abas
        const evt = new Event('productsUpdated');
        window.dispatchEvent(evt);
    }
    // Carrega produtos adicionados via interface
    loadAddedProducts() {
        return JSON.parse(localStorage.getItem('lrGourmetAddedProducts')) || [];
    }

    // Atualiza tabela de produtos adicionados
    updateAddedProductsTable() {
        const products = this.loadAddedProducts();
        const tbody = $('#addedProductsTableBody');
        tbody.empty();
        
        if (products.length === 0) {
            tbody.append('<tr><td colspan="7" class="text-center text-muted">Nenhum produto adicionado ainda.</td></tr>');
            return;
        }
        
        products.forEach((product, index) => {
            const isDataUrl = typeof product.image === 'string' && product.image.startsWith('data:');
            const imageCell = isDataUrl
                ? `<img src="${product.image}" alt="${product.name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #eee;" />`
                : `${product.image}`;
            const row = `
                <tr>
                    <td><strong>${product.name}</strong></td>
                    <td><span class="badge badge-primary">${product.category}</span></td>
                    <td>${this.formatCurrency(product.price)}</td>
                    <td>${product.description}</td>
                    <td>${imageCell}</td>
                    <td>${(product.stock === null || product.stock === undefined) ? 'Ilimitado' : product.stock}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="dashboardManager.removeProduct(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }
    
    // Remove produto customizado
    removeProduct(index) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            let products = this.loadAddedProducts();
            const productToRemove = products[index];
            
            if (productToRemove) {
                // Remover do sistema de produtos customizados
                products.splice(index, 1);
                localStorage.setItem('lrGourmetAddedProducts', JSON.stringify(products));
                
                // Remover do sistema integrado
                this.removeProductFromMainSystem(productToRemove);
                
                this.updateAddedProductsTable();
                // Notificar páginas públicas sobre a remoção
                this.notifyProductUpdate();
                alert('✅ Produto removido com sucesso!');
            }
        }
    }
    
    // Remove produto do sistema principal
    removeProductFromMainSystem(productData) {
        // Remover do sistema integrado
        let integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        integratedProducts = integratedProducts.filter(p => p.id !== productData.id);
        localStorage.setItem('lrGourmetIntegratedProducts', JSON.stringify(integratedProducts));
        
        // Remover da disponibilidade
        const availability = this.getProductAvailability();
        delete availability[productData.name];
        localStorage.setItem('lrGourmetProductAvailability', JSON.stringify(availability));

        // Remover do estado de estoque atual (se existir)
        const stockStateRaw = localStorage.getItem('lrGourmetProductStockState');
        if (stockStateRaw) {
            const stockState = JSON.parse(stockStateRaw) || {};
            delete stockState[productData.name];
            localStorage.setItem('lrGourmetProductStockState', JSON.stringify(stockState));
        }
        
        // Atualizar timestamp
        localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());
        
        // Disparar evento para atualização em outras abas
        const evt = new Event('productsUpdated');
        window.dispatchEvent(evt);
    }
    
    // Limpa formulário de adição de produto
    clearAddProductForm() {
        $('#addProductForm')[0].reset();
    }

    // ====== IMAGE PREVIEW HANDLERS ======
    async handleImageChange(e) {
        const file = e.target.files && e.target.files[0];
        const $preview = $('#productImagePreview');
        const $remove = $('#removeProductImage');
        const $crop = $('#cropImageBtn');
        const $fileName = $('#productImageFilename');
        const $fileLabel = $('#productImage').siblings('label.custom-file-label');
        if (!file) {
            this.clearImagePreview();
            // Limpa nome exibido
            if ($fileLabel.length) $fileLabel.text('Escolher arquivo');
            $fileName.text('').hide();
            return;
        }
        try {
            const dataUrl = await this.processImageFile(file);
            this.pendingImageDataUrl = dataUrl;
            $preview.attr('src', dataUrl).show();
            $remove.show();
            $crop.show();
            // Atualiza label/filename
            if ($fileLabel.length) $fileLabel.text(file.name);
            $fileName.text(file.name).show();
        } catch (err) {
            console.error('Falha ao gerar preview:', err);
            this.clearImagePreview();
            if ($fileLabel.length) $fileLabel.text('Escolher arquivo');
            $fileName.text('').hide();
        }
    }

    removeSelectedImage() {
        const $file = $('#productImage');
        $file.val('');
        this.clearImagePreview();
    }

    clearImagePreview() {
        this.pendingImageDataUrl = '';
        $('#productImagePreview').attr('src', '').hide();
        $('#removeProductImage').hide();
        $('#cropImageBtn').hide();
        const $fileName = $('#productImageFilename');
        const $fileLabel = $('#productImage').siblings('label.custom-file-label');
        if ($fileLabel.length) $fileLabel.text('Escolher arquivo');
        $fileName.text('').hide();
    }

    // ====== Cropper Integration ======
    openCropperModal() {
        const src = this.pendingImageDataUrl;
        if (!src) return;
        const img = document.getElementById('cropperImage');
        img.src = src;
        // Destrói anterior, se houver
        if (this._cropper) {
            try { this._cropper.destroy(); } catch {}
            this._cropper = null;
        }
        // Mostrar botão de deletar no modal apenas se existe imagem
        if (src) {
            $('#deleteImageInModal').show();
        } else {
            $('#deleteImageInModal').hide();
        }
        $('#cropImageModal').modal('show');
        setTimeout(() => {
            this._cropper = new Cropper(img, {
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                responsive: true,
                background: false,
                zoomable: true,
                scalable: true,
                movable: true,
            });
            // Resetar dropdown para Livre
            const $select = $('#cropAspectSelect');
            $select.val('free');
            // Aplicar Livre (sem trava de proporção)
            try { this._cropper.setAspectRatio(NaN); } catch {}
            // Ligar evento de mudança
            $select.off('change').on('change', () => {
                const val = $select.val();
                if (!this._cropper) return;
                if (val === 'free') {
                    this._cropper.setAspectRatio(NaN);
                } else {
                    const ratio = parseFloat(val);
                    this._cropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
                }
            });
        }, 200);
    }

    async applyCropperResult() {
        if (!this._cropper) return;
        try {
            const canvas = this._cropper.getCroppedCanvas({
                maxWidth: 800,
                maxHeight: 800,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            let out = '';
            try {
                out = canvas.toDataURL('image/webp', 0.9);
            } catch {
                out = canvas.toDataURL('image/png');
            }
            // Atualiza preview e estado pendente
            this.pendingImageDataUrl = out;
            $('#productImagePreview').attr('src', out).show();
            $('#cropImageBtn').show();
            $('#removeProductImage').show();
            $('#cropImageModal').modal('hide');
            // Libera recuros
            try { this._cropper.destroy(); } catch {}
            this._cropper = null;
        } catch (err) {
            console.error('Falha ao aplicar recorte:', err);
        }
    }
    
    // Remove todos os produtos customizados
    clearAllAddedProducts() {
        if (confirm('Tem certeza que deseja remover TODOS os produtos adicionados? Esta ação não pode ser desfeita.')) {
            // Carregar produtos antes de remover para limpar do sistema integrado
            const products = this.loadAddedProducts();
            
            // Remover cada produto do sistema integrado
            products.forEach(product => {
                this.removeProductFromMainSystem(product);
            });
            
            localStorage.removeItem('lrGourmetAddedProducts');
            // Limpar estado de estoque também
            localStorage.removeItem('lrGourmetProductStockState');
            this.updateAddedProductsTable();
            
            // Notificar páginas públicas sobre a limpeza
            this.notifyProductUpdate();
            
            alert('✅ Todos os produtos foram removidos!');
        }
    }
    
    // Exporta lista de produtos adicionados para CSV
    exportAddedProducts() {
        const products = this.loadAddedProducts();
        if (products.length === 0) {
            alert('Nenhum produto para exportar.');
            return;
        }
        
        // Criar CSV
        let csv = 'Nome,Categoria,Preço,Descrição,Imagem,Estoque\n';
        products.forEach(product => {
            const est = (product.stock === null || product.stock === undefined) ? 'Ilimitado' : product.stock;
            const imgLabel = (typeof product.image === 'string' && product.image.startsWith('data:')) ? 'Imagem Embutida' : (product.image || '');
            csv += `"${product.name}","${product.category}","${product.price}","${product.description}","${imgLabel}","${est}"\n`;
        });
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'produtos_adicionados.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Processa/compacta imagem no cliente e retorna Data URL
    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.onload = () => {
                const originalDataUrl = reader.result;
                // Para SVG, podemos usar diretamente
                if (file.type === 'image/svg+xml') {
                    return resolve(originalDataUrl);
                }
                const img = new Image();
                img.onload = () => {
                    try {
                        const maxDim = 800; // limita largura/altura para reduzir tamanho
                        let { width, height } = img;
                        if (width > maxDim || height > maxDim) {
                            const ratio = Math.min(maxDim / width, maxDim / height);
                            width = Math.round(width * ratio);
                            height = Math.round(height * ratio);
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        // Tenta WebP com qualidade 0.85; fallback para PNG
                        let out = '';
                        try {
                            out = canvas.toDataURL('image/webp', 0.85);
                        } catch {
                            out = canvas.toDataURL('image/png');
                        }
                        // Se por algum motivo o output ficou maior que o original, usa original
                        if (out && originalDataUrl && out.length > originalDataUrl.length) {
                            resolve(originalDataUrl);
                        } else {
                            resolve(out || originalDataUrl);
                        }
                    } catch (err) {
                        // Em caso de erro, devolve original
                        resolve(originalDataUrl);
                    }
                };
                img.onerror = () => resolve(originalDataUrl);
                img.src = originalDataUrl;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Purge all custom products added via interface and keep only default products.
     * This will:
     * - Remove lrGourmetAddedProducts
     * - Remove lrGourmetIntegratedProducts
     * - Remove lrGourmetProductOverrides
     * - Clean lrGourmetProductAvailability entries for custom products
     * - Notify public site of the update
     */
    // Remove todos os produtos customizados e mantém apenas os padrões
    purgeCustomProducts() {
        try {
            // Collect custom/integrated products to clean availability
            const added = JSON.parse(localStorage.getItem('lrGourmetAddedProducts')) || [];
            const integrated = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];

            // Remove each from main system (handles availability cleanup and events)
            added.forEach((p) => this.removeProductFromMainSystem(p));
            integrated.forEach((p) => this.removeProductFromMainSystem(p));

            // Remove storages related to custom products
            localStorage.removeItem('lrGourmetAddedProducts');
            localStorage.removeItem('lrGourmetIntegratedProducts');
            localStorage.removeItem('lrGourmetProductOverrides');
            // Zera disponibilidade por completo
            localStorage.removeItem('lrGourmetProductAvailability');
            localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());

            // Final notify to ensure public pages refresh
            this.notifyProductUpdate();

            // Update dashboard views if applicable
            this.renderProductManagement();
            this.updateProductsTable();
            this.updateAddedProductsTable();
            // Repopula o filtro de seção após a limpeza
            this.populateSectionFilter();

            alert('✅ Todos os produtos foram removidos. O site está sem nenhum produto cadastrado.');
        } catch (err) {
            console.error('Erro ao limpar produtos customizados:', err);
            alert('Ocorreu um erro ao limpar os produtos customizados. Verifique o console para detalhes.');
        }
    }

    // Horários de funcionamento
    // Preenche os selects de horários com intervalos de 30min e opção 'Fechado'
    // ===============================
    // MÉTODOS DE HORÁRIOS DE FUNCIONAMENTO
    // ===============================
    // Preenche selects de horários com intervalos de 30min e opção 'Fechado'
    fillBusinessHourSelects() {
        const times = ['Fechado'];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                let hour = h.toString().padStart(2, '0');
                let min = m.toString().padStart(2, '0');
                times.push(`${hour}:${min}`);
            }
        }
        times.push('00:00'); // Para fechar o ciclo
        for (let i = 0; i <= 6; i++) {
            const openSelect = document.getElementById(`open-${i}`);
            const closeSelect = document.getElementById(`close-${i}`);
            if (openSelect && openSelect.options.length === 0) {
                times.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t;
                    opt.textContent = t;
                    openSelect.appendChild(opt.cloneNode(true));
                });
            }
            if (closeSelect && closeSelect.options.length === 0) {
                times.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t;
                    opt.textContent = t;
                    closeSelect.appendChild(opt.cloneNode(true));
                });
            }
        }
    }

    // Salva horários de funcionamento no localStorage
    handleSaveBusinessHours(e) {
        e.preventDefault();
        const businessHours = {};
        for (let i = 0; i <= 6; i++) {
            const open = document.getElementById(`open-${i}`).value;
            const close = document.getElementById(`close-${i}`).value;
            businessHours[i] = {
                open: open,
                close: close
            };
        }
        localStorage.setItem('lrGourmetBusinessHours', JSON.stringify(businessHours));
        document.getElementById('horariosMsg').innerHTML = '<div class="alert alert-success">Horários salvos com sucesso!';
    }

    // Carrega horários salvos no formulário
    loadBusinessHoursForm() {
        const businessHours = JSON.parse(localStorage.getItem('lrGourmetBusinessHours')) || {};
        for (let i = 0; i <= 6; i++) {
            const openSelect = document.getElementById(`open-${i}`);
            const closeSelect = document.getElementById(`close-${i}`);
            if (openSelect && closeSelect) {
                openSelect.value = businessHours[i]?.open || 'Fechado';
                closeSelect.value = businessHours[i]?.close || 'Fechado';
            }
        }
        document.getElementById('horariosMsg').innerHTML = '';
    }

    // ===== FORMATAÇÃO =====
    // ===============================
    // FORMATAÇÃO DE VALORES
    // ===============================
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // ===== INTEGRAÇÃO COM O SITE PÚBLICO =====
    // ===============================
    // INTEGRAÇÃO COM O SITE PÚBLICO
    // ===============================
    notifyProductUpdate() {
        try {
            // Carrega os produtos adicionados no dashboard
            const products = this.loadAddedProducts();

            // Garante estrutura compatível com o site (nome, preço, página, seção, descrição, imagem)
            const integratedProducts = products.map(p => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                page: p.page,
                section: p.section,
                description: p.description || '',
                image: p.image || 'default-product.png',
                isCustom: true
            }));

            // Persiste no localStorage nas chaves que o site consome
            localStorage.setItem('lrGourmetIntegratedProducts', JSON.stringify(integratedProducts));
            localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());

            // Dispara evento para atualização imediata em outras abas/janelas
            const evt = new Event('productsUpdated');
            window.dispatchEvent(evt);
        } catch (err) {
            console.error('Erro ao integrar produtos com o site:', err);
        }
    }
}

// ===============================
// INICIALIZAÇÃO DO DASHBOARD
// ===============================
$(document).ready(function() {
    window.dashboardManager = new DashboardManager();
    // Preencher selects de horários ao carregar página
    window.dashboardManager.fillBusinessHourSelects();
    // Ativa a seção de horários ao clicar no menu
    $('[data-section="horarios"]').on('click', function() {
        $('.content-section').removeClass('active');
        $('#horarios-section').addClass('active');
        window.dashboardManager.fillBusinessHourSelects();
        window.dashboardManager.loadBusinessHoursForm();
    });
    // Se abrir já na seção de horários, ativa e carrega
    if ($('.nav-link.active').data('section') === 'horarios') {
        $('.content-section').removeClass('active');
        $('#horarios-section').addClass('active');
        window.dashboardManager.fillBusinessHourSelects();
        window.dashboardManager.loadBusinessHoursForm();
    }
    // Salvar horários ao enviar o formulário
    $('#horariosForm').on('submit', function(e) {
        window.dashboardManager.handleSaveBusinessHours(e);
    });
    // Inicia observador para ranking de bairros em tempo real
    window.dashboardManager.observeOrdersForRanking();
});

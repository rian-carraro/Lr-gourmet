// Dashboard JavaScript - LR Gourmet
class DashboardManager {
    renderListasDinamicas() {
        // Renderiza insumos
        const prodContainer = $("#precListasDinamicas");
        let html = '<h5>Insumos cadastrados</h5>';
        html += '<table class="table table-bordered"><thead><tr><th>Nome</th><th>Valor Total</th><th>Quantidade</th><th>Valor Unidade</th><th>Ações</th></tr></thead><tbody>';
        this.precProdutos.forEach((p, idx) => {
            html += `<tr><td>${p.nome}</td><td>R$ ${p.valor.toFixed(2)}</td><td>${p.qtd}</td><td>R$ ${(p.valorUn).toFixed(2)}</td><td><button class='btn btn-sm btn-warning' onclick='dashboardManager.editarProduto(${idx})'>Editar</button> <button class='btn btn-sm btn-danger' onclick='dashboardManager.apagarProduto(${idx})'>Apagar</button></td></tr>`;
        });
        html += '</tbody></table>';
        // Renderiza embalagens
        html += '<h5>Embalagens cadastradas</h5>';
        html += '<table class="table table-bordered"><thead><tr><th>Nome</th><th>Valor Total</th><th>Quantidade</th><th>Valor Unidade</th><th>Ações</th></tr></thead><tbody>';
        this.precEmbalagens.forEach((e, idx) => {
            html += `<tr><td>${e.nome}</td><td>R$ ${e.valor.toFixed(2)}</td><td>${e.qtd}</td><td>R$ ${(e.valorUn).toFixed(2)}</td><td><button class='btn btn-sm btn-warning' onclick='dashboardManager.editarEmbalagem(${idx})'>Editar</button> <button class='btn btn-sm btn-danger' onclick='dashboardManager.apagarEmbalagem(${idx})'>Apagar</button></td></tr>`;
        });
        html += '</tbody></table>';
        prodContainer.html(html);
    }

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
    apagarProduto(idx) {
        this.precProdutos.splice(idx, 1);
        localStorage.setItem('precProdutos', JSON.stringify(this.precProdutos));
        this.renderListasDinamicas();
    }
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
    apagarEmbalagem(idx) {
        this.precEmbalagens.splice(idx, 1);
        localStorage.setItem('precEmbalagens', JSON.stringify(this.precEmbalagens));
        this.renderListasDinamicas();
    }
    // ===== PRECIFICAÇÃO =====
    precProdutos = [];
    precEmbalagens = [];
    precItens = [];

    initPrecificacao() {
        // Carregar dados salvos
        this.precProdutos = JSON.parse(localStorage.getItem('precProdutos')) || [];
        this.precEmbalagens = JSON.parse(localStorage.getItem('precEmbalagens')) || [];
        this.precItens = [];
        this.renderPrecificacaoItens();
        this.renderListasDinamicas();
    }

    // Cadastro de produtos para precificação
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
            // Pega nome e valor ideal de venda
            const nome = $('#precNomeFinal').val();
            let valor = 0;
            const resultado = $('#precResultado').text();
            const match = resultado.match(/Valor ideal de venda por unidade:\s*R\$\s*([\d,.]+)/);
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
                        <input type="number" class="form-control precItemQtd" data-idx="${idx}" value="${item.qtd}" min="0.01" step="0.01" placeholder="Qtd usada">
                    </div>
                    <div class="form-group col-md-2">
                        <input type="text" class="form-control precItemValorTotal" data-idx="${idx}" value="${(item.valorUn * item.qtd).toFixed(2)}" readonly placeholder="Valor Total">
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
            this.precItens[idx].qtd = parseFloat($(e.target).val()) || 0;
            // Atualiza o valor total do item
            const valorUn = this.precItens[idx].valorUn || 0;
            const qtd = this.precItens[idx].qtd || 0;
            $(`.precItemValorTotal[data-idx="${idx}"]`).val((valorUn * qtd).toFixed(2));
        });
        $('.precItemRendimento').off('input').on('input', (e) => {
            const idx = $(e.target).data('idx');
            this.precItens[idx].rendimento = parseInt($(e.target).val()) || 1;
        });
    }

    addPrecificacaoItem() {
        this.precItens.push({ tipo: '', nome: '', qtd: 0, rendimento: 1, valorUn: 0 });
        this.renderPrecificacaoItens();
    }
    removePrecificacaoItem(idx) {
        this.precItens.splice(idx, 1);
        this.renderPrecificacaoItens();
    }

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
        // Valor ideal de venda por unidade
        const valorUnVenda = custoComExtras / rendimentoFinal;
        // Exibir resultado
        $('#precResultado').html(`
            <div class="alert alert-info">
                <strong>Custo total:</strong> R$ ${custoTotal.toFixed(2)}<br>
                <strong>Custo com extras:</strong> R$ ${custoComExtras.toFixed(2)}<br>
                <strong>Rendimento final:</strong> ${rendimentoFinal} unidade(s)<br>
                <strong>Valor ideal de venda por unidade:</strong> <span class="text-success">R$ ${valorUnVenda.toFixed(2)}</span>
            </div>
        `);
    }
    constructor() {
        this.isAuthenticated = false;
        this.currentSection = 'overview';
        this.charts = {};
        this.realData = this.loadRealData();
        this.init();
    }

    init() {
    this.setupEventListeners();
    this.showLoginModal();
    this.setupPrecificacaoEvents();
    }

    setupEventListeners() {
        // Login
        $('#loginBtn').on('click', () => this.handleLogin());
        $('#logoutBtn').on('click', () => this.handleLogout());
        
        // Navigation
        $('.nav-link').on('click', (e) => this.handleNavigation(e));
        
        // Mobile menu
        $('#menuToggle').on('click', (e) => {
            e.preventDefault();
            this.toggleSidebar();
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
        
        // Date filter
        $('#dateFilter').on('change', () => this.updateDashboard());
        
        // Chart controls
        $('.chart-controls .btn').on('click', (e) => this.handleChartControl(e));
        
        // Reports
        $('#generateReport').on('click', () => this.generateReport());
        $('#exportReport').on('click', () => this.exportReport());

        // Exports PDF
        $('#exportOrders').on('click', () => this.exportTableToPDF('#recentOrdersTable', 'Pedidos_Recentes'));
        $('#exportProducts').on('click', () => this.exportTableToPDF('#productsRankingTable', 'Ranking_Produtos'));
        $('#exportAddresses').on('click', () => this.exportTableToPDF('#addressesTable', 'Enderecos_Clientes'));
        
        // Add Products functionality
        $('#addProductForm').on('submit', (e) => this.handleAddProduct(e));
        $('#clearForm').on('click', () => this.clearAddProductForm());
        $('#clearAllProducts').on('click', () => this.clearAllAddedProducts());
        $('#exportProductsList').on('click', () => this.exportAddedProducts());
        // Optional purge button (if present in HTML)
        if ($('#purgeCustomProducts').length) {
            $('#purgeCustomProducts').on('click', () => this.purgeCustomProducts());
        }
        // Horários de funcionamento
        $('#horariosForm').on('submit', (e) => this.handleSaveBusinessHours(e));
        // Carregar horários ao abrir seção
        $('[data-section="horarios"]').on('click', () => this.loadBusinessHoursForm());
    }

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

    showLoginModal() {
        $('#loginModal').modal('show');
    }

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

    handleLogout() {
        this.isAuthenticated = false;
        location.reload();
    }

    initializeDashboard() {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            this.updateDashboard();
            this.initializeCharts();
        }, 100);
    }

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
                status: ['Pendente', 'Entregue', 'Cancelado'][Math.floor(Math.random() * 3)],
                date,
                bairro: bairros[Math.floor(Math.random() * bairros.length)]
            });
        }

        return { orders, customers: [] };
    }

    // Product management methods
    loadProductsList() {
    // Lista de todos os produtos do cardápio com categorias corretas
    const defaultProducts = [
            // Página Inicial
            { name: 'Bom Bom de Morango', category: 'Doce no Pote', price: 12.00, page: 'index', section: 'doces' },
            { name: 'Bom Bom de Uva', category: 'Doce no Pote', price: 12.00, page: 'index', section: 'doces' },
            { name: 'Tortinha de Limão', category: 'Doce no Pote', price: 12.00, page: 'index', section: 'doces' },
            { name: 'Pavê de Prestigio', category: 'Doce no Pote', price: 12.50, page: 'index', section: 'doces' },
            { name: 'Refrigerante cola 350ml', category: 'Bebidas', price: 6.00, page: 'index', section: 'bebidas' },
            { name: 'Refrigerante cola zero 350ml', category: 'Bebidas', price: 6.00, page: 'index', section: 'bebidas' },
            { name: 'Água Mineral com gás 500ml', category: 'Bebidas', price: 4.00, page: 'index', section: 'bebidas' },
            { name: 'Água Mineral sem gás 500ml', category: 'Bebidas', price: 4.00, page: 'index', section: 'bebidas' },

            // Cardápio
            { name: 'Trufa de Nutella', category: 'Trufa ao Leite', price: 6.50, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Ninho', category: 'Trufa ao Leite', price: 6.00, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Ninho com Nutella', category: 'Trufa ao Leite', price: 6.00, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Oreo', category: 'Trufa ao Leite', price: 6.00, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Brigadeiro', category: 'Trufa ao Leite', price: 6.00, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Limão', category: 'Trufa ao Leite', price: 6.00, page: 'cardapio', section: 'trufas-ao-leite' },
            { name: 'Trufa de Pistache', category: 'Trufa Branca', price: 6.50, page: 'cardapio', section: 'trufas-brancas' },
            { name: 'Refrigerante cola 350ml', category: 'Bebidas', price: 6.00, page: 'cardapio', section: 'bebidas' },
            { name: 'Refrigerante cola zero 350ml', category: 'Bebidas', price: 6.00, page: 'cardapio', section: 'bebidas' },
            { name: 'Água Mineral com gás 500ml', category: 'Bebidas', price: 4.00, page: 'cardapio', section: 'bebidas' },
            { name: 'Água Mineral sem gás 500ml', category: 'Bebidas', price: 4.00, page: 'cardapio', section: 'bebidas' },

            // Pistache
            { name: 'Trufa de Ninho (Casquinha de Pistache)', category: 'Casquinha de Pistache', price: 7.00, page: 'pistache', section: 'casquinha-de-pistache' },
            { name: 'Trufa de Pistache (Casquinha de Pistache)', category: 'Casquinha de Pistache', price: 7.00, page: 'pistache', section: 'casquinha-de-pistache' }
        ];

        // Carregar produtos customizados integrados
        const integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        const allProducts = [...defaultProducts];
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

    getProductAvailability() {
        return JSON.parse(localStorage.getItem('lrGourmetProductAvailability')) || {};
    }

    setProductAvailability(productName, isAvailable) {
        const availability = this.getProductAvailability();
        availability[productName] = isAvailable;
        localStorage.setItem('lrGourmetProductAvailability', JSON.stringify(availability));
        this.updateProductDisplay();
    }

    isProductAvailable(productName) {
        const availability = this.getProductAvailability();
        return availability[productName] !== false; // Por padrão, produtos são disponíveis
    }

    renderProductManagement() {
        const products = this.loadProductsList();
        const grid = $('#productManagementGrid');
        grid.empty();

        // Agrupar por página
        const pages = {};
        products.forEach(product => {
            const page = product.page || 'index';
            if (!pages[page]) pages[page] = [];
            pages[page].push(product);
        });

        // Filtro de página
        let selectedPage = window.selectedProductPage || 'index';
        // Atualizar botões de filtro
        $('#productPageFilters button').removeClass('active');
        $(`#productPageFilters button[data-page="${selectedPage}"]`).addClass('active');

        // Renderizar apenas a página selecionada
        if (pages[selectedPage]) {
            // Título da página
            let pageTitle = '';
            if (selectedPage === 'index') pageTitle = 'Página Inicial';
            else if (selectedPage === 'cardapio') pageTitle = 'Cardápio';
            else if (selectedPage === 'pistache') pageTitle = 'Pistache';
            else pageTitle = selectedPage;

            grid.append(`<div class="col-12 mt-4 mb-2"><h5 class="text-primary">${pageTitle}</h5></div>`);

            // Agrupar por categoria
            const categories = {};
            pages[selectedPage].forEach(product => {
                if (!categories[product.category]) categories[product.category] = [];
                categories[product.category].push(product);
            });

            Object.keys(categories).forEach(category => {
                const categoryHtml = `
                    <div class="col-12 mb-3">
                        <h6 class="text-muted mb-2">${category}</h6>
                        <div class="row">
                            ${categories[category].map(product => `
                                <div class="col-lg-4 col-md-6 mb-2">
                                    <div class="product-toggle-card ${this.isProductAvailable(product.name) ? 'available' : 'unavailable'}">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="product-info">
                                                <strong>${product.name}</strong>
                                                <br><small class="text-muted">R$ ${product.price.toFixed(2)}</small>
                                            </div>
                                            <div class="custom-switch">
                                                <input type="checkbox" 
                                                       class="product-toggle" 
                                                       id="toggle-${product.name.replace(/\s+/g, '-')}"
                                                       data-product="${product.name}"
                                                       ${this.isProductAvailable(product.name) ? 'checked' : ''}>
                                                <label for="toggle-${product.name.replace(/\s+/g, '-')}" class="switch-label">
                                                    <span class="switch-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                grid.append(categoryHtml);
            });
        }

        // Adicionar event listeners para os toggles
        $('.product-toggle').on('change', (e) => {
            const productName = $(e.target).data('product');
            const isAvailable = $(e.target).is(':checked');
            this.setProductAvailability(productName, isAvailable);
        });

        // Adicionar event listeners para os filtros de página
        $('#productPageFilters button').off('click').on('click', function() {
            window.selectedProductPage = $(this).data('page');
            dashboardManager.renderProductManagement();
        });
    }

    enableAllProducts() {
        const products = this.loadProductsList();
        products.forEach(product => {
            this.setProductAvailability(product.name, true);
        });
        this.renderProductManagement();
        this.updateProductsTable();
    }

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

    updateProductDisplay() {
        // Esta função será chamada para atualizar a exibição no site principal
        // Por enquanto, apenas salva no localStorage para ser lida pelo script.js
        const event = new CustomEvent('productAvailabilityChanged', {
            detail: { availability: this.getProductAvailability() }
        });
        window.dispatchEvent(event);
    }

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
    
    isNewCustomer(customer) {
        if (!customer.firstOrder) return true;
        const firstOrder = new Date(customer.firstOrder);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return firstOrder >= thirtyDaysAgo;
    }

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

    updateTables(data) {
        this.updateRecentOrdersTable(data);
        this.updateProductsTable(data);
        this.updateTopCustomersTable(data);
        this.updateLocationTable();
    }

    updateRecentOrdersTable(data) {
        const tbody = $('#recentOrdersTable tbody');
        tbody.empty();
        
        const recent = data.slice(-10).reverse();
        recent.forEach(order => {
            const statusClass = order.status === 'Entregue' ? 'status-completed' : 
                               order.status === 'Cancelado' ? 'status-cancelled' : 'status-pending';
            
            tbody.append(`
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.items.length} itens</td>
                    <td>${this.formatCurrency(order.total)}</td>
                    <td>${order.payment}</td>
                    <td><span class="badge ${statusClass}">${order.status}</span></td>
                    <td>${order.date.toLocaleDateString('pt-BR')}</td>
                </tr>
            `);
        });
    }

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

    updateLocationTable() {
        const filteredData = this.filterDataByPeriod($('#dateFilter').val());
        const locationStats = {};
        
        filteredData.forEach(order => {
            if (!locationStats[order.bairro]) {
                locationStats[order.bairro] = {
                    orders: 0,
                    revenue: 0
                };
            }
            locationStats[order.bairro].orders++;
            locationStats[order.bairro].revenue += order.total;
        });
        
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

    toggleSidebar() {
        $('.sidebar').toggleClass('show');
        $('#mobileOverlay').toggleClass('show');
        $('body').toggleClass('sidebar-open');
    }

    closeSidebar() {
        $('.sidebar').removeClass('show');
        $('#mobileOverlay').removeClass('show');
        $('body').removeClass('sidebar-open');
    }

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
    
    handleAddProduct(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('productImage');
        const file = fileInput.files[0];
        let imageName = 'default-product.png';
        
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
            
            imageName = file.name;
        }
        
        // NOVO: capturar página e seção
        const page = $('#productPage').val();
        const section = $('#productSection').val();
        const productData = {
            name: $('#productName').val().trim(),
            price: parseFloat($('#productPrice').val()),
            page: page,
            section: section,
            description: $('#productDescription').val().trim(),
            image: imageName,
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
        // Disparar evento para atualizar páginas públicas
        this.notifyProductUpdate();
        alert('✅ Produto adicionado com sucesso! Ele já está disponível na página e seção selecionada.');
    }
    
    saveProduct(productData) {
    // Salvar no sistema de produtos customizados
    let customProducts = JSON.parse(localStorage.getItem('lrGourmetAddedProducts')) || [];
    customProducts.push(productData);
    localStorage.setItem('lrGourmetAddedProducts', JSON.stringify(customProducts));
    // Integrar com o sistema principal de produtos
    this.integrateProductIntoMainSystem(productData);
    }
    
    integrateProductIntoMainSystem(productData) {
        // Carregar produtos integrados existentes
        let integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        
        // Adicionar novo produto ao sistema integrado
        const integratedProduct = {
            id: productData.id,
            name: productData.name,
            price: Number(productData.price),
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
    loadAddedProducts() {
        return JSON.parse(localStorage.getItem('lrGourmetAddedProducts')) || [];
    }

    updateAddedProductsTable() {
        const products = this.loadAddedProducts();
        const tbody = $('#addedProductsTableBody');
        tbody.empty();
        
        if (products.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-center text-muted">Nenhum produto adicionado ainda.</td></tr>');
            return;
        }
        
        products.forEach((product, index) => {
            const row = `
                <tr>
                    <td><strong>${product.name}</strong></td>
                    <td><span class="badge badge-primary">${product.category}</span></td>
                    <td>${this.formatCurrency(product.price)}</td>
                    <td>${product.description}</td>
                    <td>${product.image}</td>
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
    
    removeProductFromMainSystem(productData) {
        // Remover do sistema integrado
        let integratedProducts = JSON.parse(localStorage.getItem('lrGourmetIntegratedProducts')) || [];
        integratedProducts = integratedProducts.filter(p => p.id !== productData.id);
        localStorage.setItem('lrGourmetIntegratedProducts', JSON.stringify(integratedProducts));
        
        // Remover da disponibilidade
        const availability = this.getProductAvailability();
        delete availability[productData.name];
        localStorage.setItem('lrGourmetProductAvailability', JSON.stringify(availability));
        
        // Atualizar timestamp
        localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());
        
        // Disparar evento para atualização em outras abas
        const evt = new Event('productsUpdated');
        window.dispatchEvent(evt);
    }
    
    clearAddProductForm() {
        $('#addProductForm')[0].reset();
    }
    
    clearAllAddedProducts() {
        if (confirm('Tem certeza que deseja remover TODOS os produtos adicionados? Esta ação não pode ser desfeita.')) {
            // Carregar produtos antes de remover para limpar do sistema integrado
            const products = this.loadAddedProducts();
            
            // Remover cada produto do sistema integrado
            products.forEach(product => {
                this.removeProductFromMainSystem(product);
            });
            
            localStorage.removeItem('lrGourmetAddedProducts');
            this.updateAddedProductsTable();
            
            // Notificar páginas públicas sobre a limpeza
            this.notifyProductUpdate();
            
            alert('✅ Todos os produtos foram removidos!');
        }
    }
    
    exportAddedProducts() {
        const products = this.loadAddedProducts();
        if (products.length === 0) {
            alert('Nenhum produto para exportar.');
            return;
        }
        
        // Criar CSV
        let csv = 'Nome,Categoria,Preço,Descrição,Imagem\n';
        products.forEach(product => {
            csv += `"${product.name}","${product.category}","${product.price}","${product.description}","${product.image}"\n`;
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

    /**
     * Purge all custom products added via interface and keep only default products.
     * This will:
     * - Remove lrGourmetAddedProducts
     * - Remove lrGourmetIntegratedProducts
     * - Remove lrGourmetProductOverrides
     * - Clean lrGourmetProductAvailability entries for custom products
     * - Notify public site of the update
     */
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
            localStorage.setItem('lrGourmetProductsLastUpdate', Date.now().toString());

            // Final notify to ensure public pages refresh
            this.notifyProductUpdate();

            // Update dashboard views if applicable
            this.renderProductManagement();
            this.updateProductsTable();
            this.updateAddedProductsTable();

            alert('✅ Produtos customizados removidos. Somente os produtos padrão permaneceram.');
        } catch (err) {
            console.error('Erro ao limpar produtos customizados:', err);
            alert('Ocorreu um erro ao limpar os produtos customizados. Verifique o console para detalhes.');
        }
    }

    // Horários de funcionamento
    // Preenche os selects de horários com intervalos de 30min e opção 'Fechado'
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
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // ===== INTEGRAÇÃO COM O SITE PÚBLICO =====
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

// Initialize dashboard when DOM is ready
$(document).ready(function() {
    window.dashboardManager = new DashboardManager();
    // Preencher selects ao carregar página
    window.dashboardManager.fillBusinessHourSelects();
    // Ativa a seção de horários ao clicar no menu
    $('[data-section="horarios"]').on('click', function() {
        // Remove active das outras seções
        $('.content-section').removeClass('active');
        $('#horarios-section').addClass('active');
        // Preenche e carrega os horários salvos no formulário
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
});

// entregas.js - Taxa de entrega fixa para Jaú/SP
const TAXA_ENTREGA_JAU = 10.00;

// Função para converter CEP para número
function cepParaNumero(cep) {
    return parseInt(cep.replace(/\D/g, ''), 10);
}

// Função para validar se o CEP é de Jaú
function validarCEPJau(cep) {
    const cepNumero = cepParaNumero(cep);
    // Faixa de CEPs de Jaú: 17200-001 a 17229-999
    return cepNumero >= 17200001 && cepNumero <= 17229999;
}

// Função para calcular a taxa de entrega
function calcularTaxaEntrega(cep) {
    // Valida se o CEP é válido (apenas números)
    const cepNumero = cepParaNumero(cep);
    if (isNaN(cepNumero) || cep.replace(/\D/g, '').length !== 8) {
        return {
            erro: "CEP inválido. Digite um CEP com 8 dígitos.",
            taxa: null
        };
    }

    // Verifica se o CEP é de Jaú
    if (!validarCEPJau(cep)) {
        return {
            erro: "CEP não atendido. Realizamos entregas apenas em Jaú/SP.",
            taxa: null
        };
    }

    // Retorna taxa fixa para qualquer CEP de Jaú
    return {
        taxa: TAXA_ENTREGA_JAU,
        mensagem: "Taxa de entrega para Jaú/SP"
    };
}
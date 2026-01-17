import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './MemberTokenRequester.css';

const MemberTokenRequester = () => {
    const [celular, setCelular] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formatPhone = (value) => {
        if (!value) return "";
        value = value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length <= 10) {
            return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        }
        return value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    };

    const handleChange = (e) => {
        setCelular(formatPhone(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!celular || celular.replace(/\D/g, '').length < 10) {
            toast.warn('Por favor, insira um número de celular válido (DDD + número).');
            setLoading(false);
            return;
        }
        const formattedCelular = formatPhoneNumberToE164(celular);

        try {
            const response = await axios.post('/membros/new/token', {
                celular: formattedCelular
            });

            const token = response.data.access_token;
            const newMemberLink = `/new-member?token=${token}`;
            toast.success(
                <span>
                    Token gerado com sucesso!
                </span>, { autoClose: false }
            );
            navigate('/');

        } catch (err) {
            toast.error('Ocorreu um erro ao gerar o token. Verifique o número e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumberToE164 = (maskedNumber) => {
        // Remove todos os caracteres não numéricos
        const digits = maskedNumber.replace(/\D/g, '');
        // Adiciona o código do país (Brasil) se não estiver presente
        // Assumimos que números sem 55 no início são locais e devem ser prefixados com 55
        return digits.startsWith('55') ? digits : `55${digits}`;
    };

    return (
        <div className="member-token-requester-container">
            <ToastContainer />
            <div className="token-requester-header">
                <h2>Gerar Token para Novo Membro</h2>
                <p className="text-muted">Informe seu celular para iniciar o cadastro.</p>
            </div>

            <form onSubmit={handleSubmit} className="token-requester-form">
                <div className="mb-3">
                    <label htmlFor="celular" className="form-label">Celular:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="celular"
                        name="celular"
                        value={celular}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                    {loading ? 'Gerando...' : 'Gerar Token'}
                </button>
            </form>
        </div>
    );
};

export default MemberTokenRequester;

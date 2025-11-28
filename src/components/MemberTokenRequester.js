import React, { useState } from 'react';
import axios from 'axios';
import './MemberTokenRequester.css';

const MemberTokenRequester = () => {
    const [celular, setCelular] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
        setError('');
        setSuccess('');

        if (!celular) {
            setError('Por favor, informe o número do celular.');
            return;
        }

        try {
            const response = await axios.post('/membros/new/token', {
                telefone: celular.replace(/\D/g, "")
            });

            const token = response.data.access_token;
            const newMemberLink = `/new-member?token=${token}`;
            setSuccess(
                <span>
                    Token gerado com sucesso! Por favor, acesse o link a seguir para continuar o cadastro: 
                    <a href={newMemberLink}>
                        {`${newMemberLink.substring(0, 40)}...${newMemberLink.substring(newMemberLink.length - 20)}`}
                    </a>
                </span>
            );

        } catch (err) {
            setError('Ocorreu um erro ao gerar o token. Verifique o número e tente novamente.');
        }
    };

    return (
        <div className="member-token-requester-container">
            <div className="token-requester-header">
                <h2>Gerar Token para Novo Membro</h2>
                <p className="text-muted">Informe seu celular para iniciar o cadastro.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

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
                <button type="submit" className="btn btn-primary btn-submit">
                    Gerar Token
                </button>
            </form>
        </div>
    );
};

export default MemberTokenRequester;

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MemberUpdate.css';

const MemberUpdate = () => {
    const [formData, setFormData] = useState({
        nome: '',
        sexo: '',
        nascimento: '',
        naturalidade: '',
        estado_civil: '',
        nome_conjuge: '',
        data_casamento: '',
        rg: '',
        escolaridade: '',
        profissao: '',
        nome_pai: '',
        nome_mae: '',
        telefone: '',
        celular: '',
        email: '',
        endereco: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        pais: '',
        tipo_membro: '',
        oficio: '',
        batismo_data: '',
        batismo_pastor: '',
        batismo_igreja: '',
        profissao_fe_data: '',
        profissao_fe_pastor: '',
        profissao_fe_igreja: '',
    });

    registerLocale("ptBR", ptBR);

    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const blockedFields = ['id', 'tipo_membro', 'oficio'];

    // converter string ISO 8601 ou Date -> objeto Date
    const toDateObject = (dateInput) => {
        if (!dateInput) return null;
        if (dateInput instanceof Date) return dateInput;
        // Assume ISO 8601 string if not a Date object
        try {
            return new Date(dateInput);
        } catch (e) {
            console.error("Erro ao converter data para objeto Date:", e);
            return null;
        }
    };

    // converter objeto Date -> string ISO 8601
    const toStringISO = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return '';
        return date.toISOString();
    };

    const formatPhone = (value) => {
        if (!value) return "";

        // Remove qualquer coisa que não seja número
        value = value.replace(/\D/g, "");

        // Limita em 11 dígitos (padrão Brasil)
        if (value.length > 11) value = value.slice(0, 11);

        // Aplicar máscara
        if (value.length <= 10) {
            // Telefone fixo (8 dígitos)
            return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        }

        // Celular (9 dígitos)
        return value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    };

    const formatCEP = (value) => {
        if (!value) return "";

        // remove tudo que não for número
        value = value.replace(/\D/g, "");

        // limita a 8 dígitos
        if (value.length > 8) value = value.slice(0, 8);

        // aplica máscara
        return value.replace(/(\d{5})(\d{0,3})/, "$1-$2");
    };


    const getToken = useCallback(() => {
        const params = new URLSearchParams(location.search);
        return params.get('token');
    }, [location.search]);

    useEffect(() => {
        const fetchMemberData = async () => {
            const token = getToken();
            if (token) {
                try {
                    const response = await axios.get('/membros/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFormData(response.data);
                } catch (err) {
                    toast.error('Ocorreu um erro ao buscar os dados do membro.');
                }
            }
        };

        fetchMemberData();
    }, [getToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "telefone" || name === "celular") {
            setFormData(prev => ({
                ...prev,
                [name]: formatPhone(value)
            }));
            return;
        }

        if (name === "cep") {
            setFormData(prev => ({
                ...prev,
                [name]: formatCEP(value)
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = getToken();

        if (!token) {
            toast.error('Token não encontrado.');
            setLoading(false);
            return;
        }

        try {
            await axios.put('/membros/me', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Dados atualizados com sucesso!');
        } catch (err) {
            toast.error('Ocorreu um erro ao atualizar os dados.');
        } finally {
            setLoading(false);
        }
    };
    
    const fieldGroups = {
        'Dados Pessoais': [
            'nome', 'sexo', 'nascimento', 'naturalidade', 'estado_civil', 'nome_conjuge', 'data_casamento',
            'rg', 'escolaridade', 'profissao', 'nome_pai', 'nome_mae'
        ],
        'Contato': ['telefone', 'celular', 'email'],
        'Endereço': ['endereco', 'complemento', 'bairro', 'cidade', 'pais', 'cep'],
        'Dados Eclesiásticos': ['tipo_membro', 'oficio'],
        'Batismo': ['batismo_data', 'batismo_pastor', 'batismo_igreja'],
        'Profissão de Fé': ['profissao_fe_data', 'profissao_fe_pastor', 'profissao_fe_igreja']
    };

    return (
        <div className="member-update-container">
            <ToastContainer />
            <div className="update-header">
                <h2>Atualização de Dados</h2>
                <p className="text-muted">Mantenha suas informações sempre atualizadas</p>
            </div>

            <form onSubmit={handleSubmit} className="update-form">
                {Object.entries(fieldGroups).map(([section, fields]) => (
                    <div key={section} className="form-section">
                        <h5 className="section-title">{section}</h5>
                        <div className="row">
                            {fields.map((key) => {
                                const isDatePicker = ['nascimento', 'data_casamento', 'batismo_data', 'profissao_fe_data'].includes(key);
                                const isSelect = ['escolaridade', 'estado_civil', 'sexo'].includes(key);
                                const isBlocked = blockedFields.includes(key);

                                return (
                                    <div className="col-12 col-md-6 col-lg-4 mb-3" key={key}>
                                        <label htmlFor={key} className="form-label">
                                            {`${key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:`}
                                        </label>

                                        {isBlocked ? (
                                            <input
                                                type="text"
                                                className="form-control blocked"
                                                id={key}
                                                name={key}
                                                value={formData[key] || ''}
                                                readOnly
                                            />
                                        ) : isDatePicker ? (
                                            <DatePicker
                                                locale="ptBR"
                                                selected={toDateObject(formData[key])}
                                                onChange={(date) =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        [key]: toStringISO(date)
                                                    }))
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Selecione a data"
                                                className="form-control"
                                                showYearDropdown
                                                showMonthDropdown
                                                dropdownMode="select"
                                            />
                                        ) : isSelect ? (
                                            <select
                                                className="form-select"
                                                name={key}
                                                id={key}
                                                value={formData[key] || ""}
                                                onChange={handleChange}
                                            >
                                                <option value="">Selecione...</option>
                                                                                                 {
                                                                                                    (key === "escolaridade" ?
                                                                                                        ["Ensino Fundamental Incompleto", "Ensino Fundamental Completo",
                                                                                                            "Ensino Médio Incompleto", "Ensino Médio Completo",
                                                                                                            "Superior Incompleto", "Superior Completo",
                                                                                                            "Pós-Graduação", "Mestrado", "Doutorado", "Outro"] :
                                                                                                                                                                                                                 key === "estado_civil" ?
                                                                                                                                                                                                                    ["Solteiro", "Casado", "Divorciado", "Separado", "Viúvo", "União Estável"] :                                                                                                            key === "sexo" ?
                                                                                                                ["Feminino", "Masculino"] :
                                                                                                                [])
                                                                                                        .map(option => (
                                                                                                            <option key={option} value={option}>
                                                                                                                {option}
                                                                                                            </option>
                                                                                                        ))
                                                                                                }
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control"
                                                id={key}
                                                name={key}
                                                value={formData[key] || ''}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                    {loading ? 'Atualizando...' : 'Atualizar Dados'}
                </button>
            </form>
        </div>
    );
};

export default MemberUpdate;

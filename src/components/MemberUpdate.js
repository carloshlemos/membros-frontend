import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import './MemberUpdate.css';

const MemberUpdate = () => {
    const [formData, setFormData] = useState({
        nome: '',
        sexo: '',
        nascimento: '',
        naturalidade: '',
        estado_civil: '',
        escolaridade: '',
        profissao: '',
        telefone: '',
        celular: '',
        email: '',
        endereco: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        tipo_membro: '',
        oficio: ''
    });

    registerLocale("ptBR", ptBR);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();

    const blockedFields = ['id', 'tipo_membro'];

    // converter string dd/mm/yyyy -> objeto Date (CORRIGIDO)
    const toDateObject = (str) => {
        if (!str || !str.includes('/')) return null;
        const [day, month, year] = str.split('/');
        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    // converter objeto Date -> dd/mm/yyyy
    const toStringBR = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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


    const getToken = () => {
        const params = new URLSearchParams(location.search);
        return params.get('token');
    };

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
                    setError('Ocorreu um erro ao buscar os dados do membro.');
                }
            }
        };

        fetchMemberData();
    }, [location.search]);

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
        setError('');
        setSuccess('');
        const token = getToken();

        if (!token) {
            setError('Token não encontrado.');
            return;
        }

        try {
            await axios.put('/membros/me', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Dados atualizados com sucesso!');

            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError('Ocorreu um erro ao atualizar os dados.');
        }
    };

    const fieldGroups = {
        'Dados Pessoais': ['nome', 'sexo', 'nascimento', 'naturalidade', 'estado_civil', 'escolaridade', 'profissao'],
        'Contato': ['telefone', 'celular', 'email'],
        'Endereço': ['endereco', 'complemento', 'bairro', 'cep', 'cidade']
    };

    return (
        <div className="member-update-container">
            <div className="update-header">
                <h2>Atualização de Dados</h2>
                <p className="text-muted">Mantenha suas informações sempre atualizadas</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="update-form">
                {Object.entries(fieldGroups).map(([section, fields]) => (
                    <div key={section} className="form-section">
                        <h5 className="section-title">{section}</h5>
                        <div className="row">
                            {fields.map((key) => (
                                <div className="col-12 col-md-6 col-lg-4 mb-3" key={key}>
                                <label htmlFor={key} className="form-label">
                                        {`${key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:`}
                                    </label>

                                    {key === "nascimento" ? (
                                        <DatePicker
                                            locale="ptBR"
                                            selected={toDateObject(formData[key])}
                                            onChange={(date) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    [key]: toStringBR(date)
                                                }))
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Selecione a data"
                                            className="form-control"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                        />
                                    ) : key === "escolaridade" ? (
                                        <select
                                            className={`form-select ${blockedFields.includes(key) ? 'blocked' : ''}`}
                                            name={key}
                                            id={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            disabled={blockedFields.includes(key)}
                                        >
                                            <option value="">Selecione...</option>
                                            {[
                                                "Ensino Fundamental Incompleto",
                                                "Ensino Fundamental Completo",
                                                "Ensino Médio Incompleto",
                                                "Ensino Médio Completo",
                                                "Superior Incompleto",
                                                "Superior Completo",
                                                "Pós-Graduação",
                                                "Mestrado",
                                                "Doutorado",
                                                "Outro"
                                            ].map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : key === "estado_civil" ? (
                                        <select
                                            className={`form-select ${blockedFields.includes(key) ? 'blocked' : ''}`}
                                            name={key}
                                            id={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            disabled={blockedFields.includes(key)}
                                        >
                                            <option value="">Selecione...</option>
                                            {[
                                                "Solteiro(a)",
                                                "Casado(a)",
                                                "Divorciado(a)",
                                                "Separado(a)",
                                                "Viúvo(a)",
                                                "União Estável"
                                            ].map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    ) : key === "sexo" ? (
                                        <select
                                            className={`form-select ${blockedFields.includes(key) ? 'blocked' : ''}`}
                                            name={key}
                                            id={key}
                                            value={formData[key] || ""}
                                            onChange={handleChange}
                                            disabled={blockedFields.includes(key)}
                                        >
                                            <option value="">Selecione...</option>
                                            {[
                                                "Feminino",
                                                "Masculino"
                                            ].map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className={`form-control ${blockedFields.includes(key) ? 'blocked' : ''}`}
                                            id={key}
                                            name={key}
                                            value={formData[key] || ''}
                                            onChange={handleChange}
                                            readOnly={blockedFields.includes(key)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button type="submit" className="btn btn-primary btn-submit">
                    Atualizar Dados
                </button>
            </form>
        </div>
    );
};

export default MemberUpdate;

import React, {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import {useLocation} from "react-router-dom";
import './MemberCreate.css';

registerLocale("ptBR", ptBR);

const MemberCreate = () => {
    const [formData, setFormData] = useState({
        nome: "",
        nascimento: "",
        naturalidade: "",
        estado_civil: "",
        escolaridade: "",
        profissao: "",
        telefone: "",
        celular: "",
        email: "",
        endereco: "",
        complemento: "",
        bairro: "",
        cep: "",
        tipo_membro: "",
        oficio: ""
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
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

            setSuccess('Dados cadastrados com sucesso!');

            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError('Ocorreu um erro ao cadastrar os dados.');
        }
    };

    const fieldGroups = {
        'Dados Pessoais': ['nome', 'sexo', 'nascimento', 'naturalidade', 'estado_civil', 'escolaridade', 'profissao'],
        'Contato': ['telefone', 'celular', 'email'],
        'Endereço': ['endereco', 'complemento', 'bairro', 'cep']
    };

    return (
        <div className="container py-3" style={{ maxWidth: "1000px" }}>
            <h2 className="mb-4">Cadastro:</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                {Object.entries(fieldGroups).map(([section, fields]) => (
                    <div key={section} className="mb-4">
                        <h5 className="fw-bold">{section}</h5>
                        <hr />
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

                <button type="submit" className="btn btn-primary w-100 mt-3">
                    Salvar
                </button>
            </form>

            <style>{`
                .blocked {
                    background-color: #e9ecef !important;
                    color: #6c757d !important;
                    cursor: not-allowed !important;
                }
            `}</style>
        </div>
    );
};

export default MemberCreate;


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InputMask } from '@react-input/mask';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalMembros, setTotalMembros] = useState(0);
    const [sortBy, setSortBy] = useState('nome');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchNome, setSearchNome] = useState('');
    const [filterNome, setFilterNome] = useState('');

    // State para o modal de celular
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [currentMembroId, setCurrentMembroId] = useState(null);
    const [phoneNumberInput, setPhoneNumberInput] = useState('');

    const phoneInputRef = useRef(null);

    useEffect(() => {
        if (showPhoneModal && phoneInputRef.current) {
            phoneInputRef.current.focus();
        }
    }, [showPhoneModal]);

    useEffect(() => {
        const fetchMembros = async () => {
            setLoading(true);
            try {
                const skip = (currentPage - 1) * itemsPerPage;
                const response = await axios.get('/membros', {
                    params: {
                        skip,
                        limit: itemsPerPage,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                        nome: filterNome || undefined
                    }
                });
                setMembros(response.data.membros);
                setTotalMembros(response.data.total);
            } catch (err) {
                toast.error('Ocorreu um erro ao buscar os membros.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembros();
    }, [currentPage, itemsPerPage, sortBy, sortOrder, filterNome]);

    const handleGenerateLinkClick = (membroId) => {
        setCurrentMembroId(membroId);
        setPhoneNumberInput(''); // Limpa o input ao abrir o modal
        setShowPhoneModal(true);
    };

    const formatPhoneNumberToE164 = (maskedNumber) => {
        // Remove todos os caracteres não numéricos
        const digits = maskedNumber.replace(/\D/g, '');
        // Adiciona o código do país (Brasil) se não estiver presente
        // Assumimos que números sem 55 no início são locais e devem ser prefixados com 55
        return digits.startsWith('55') ? digits : `55${digits}`;
    };

    const generateToken = async (membroId, celular) => {
        try {
            await axios.post(`/membros/${membroId}/token`, { celular });
            toast.success('O link para atualização foi enviado para o celular informado.');
        } catch (err) {
            toast.error('Ocorreu um erro ao gerar o token.');
            console.error(err);
        } finally {
            setShowPhoneModal(false);
            setCurrentMembroId(null);
            setPhoneNumberInput('');
        }
    };

    const handlePhoneNumberSubmit = () => {
        if (!phoneNumberInput || phoneNumberInput.replace(/\D/g, '').length < 10) {
            toast.warn('Por favor, insira um número de celular válido (DDD + número).');
            return;
        }
        const formattedCelular = formatPhoneNumberToE164(phoneNumberInput);
        generateToken(currentMembroId, formattedCelular);
    };

    

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const totalPages = Math.ceil(totalMembros / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <ToastContainer />
            <div className="dashboard-header">
                <div className="header-title-section">
                    <div>
                        <h2>Painel do Administrador</h2>
                        <p className="text-muted">Gerencie os membros cadastrados</p>
                    </div>
                    <a
                        href="/request-new-member-token"
                        className="btn btn-primary btn-new-member"
                    >
                        + Novo Membro
                    </a>                </div>
            </div>

            

            <div className="search-section mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrar por nome"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentPage(1);
                                setFilterNome(searchNome);
                            }
                        }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setCurrentPage(1);
                            setFilterNome(searchNome);
                        }}
                    >
                        Buscar
                    </button>
                    {filterNome && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setSearchNome('');
                                setFilterNome('');
                                setCurrentPage(1);
                            }}
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
                                Nome {sortBy === 'nome' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th>Celular</th>
                            <th onClick={() => handleSort('tipo_membro')} style={{ cursor: 'pointer' }}>
                                Tipo de Membro {sortBy === 'tipo_membro' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th onClick={() => handleSort('oficio')} style={{ cursor: 'pointer' }}>
                                Ofício {sortBy === 'oficio' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membros.map((membro) => (
                            <tr key={membro.id}>
                                <td>{membro.nome || 'N/A'}</td>
                                <td>{membro.email || 'N/A'}</td>
                                <td>{membro.celular || 'N/A'}</td>
                                <td>{membro.tipo_membro || 'N/A'}</td>
                                <td>{membro.oficio || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => alert(`Detalhes do Membro ${membro.nome}`)}
                                    >
                                        Ver Detalhes
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleGenerateLinkClick(membro.id)}
                                    >
                                        Gerar Link
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                Anterior
                            </button>
                        </li>
                        {(() => {
                            const maxPagesToShow = 5;
                            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                            let endPage = startPage + maxPagesToShow - 1;

                            if (endPage > totalPages) {
                                endPage = totalPages;
                                startPage = Math.max(1, endPage - maxPagesToShow + 1);
                            }

                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                        <button onClick={() => paginate(i)} className="page-link">
                                            {i}
                                        </button>
                                    </li>
                                );
                            }

                            return pages;
                        })()}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                Próximo
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Modal de Input de Celular */}
            {showPhoneModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Informar Celular</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowPhoneModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Por favor, digite o número do celular para enviar o link de atualização:</p>
                                <div className="input-group mb-3">
                                    <span className="input-group-text"><i className="bi bi-phone"></i></span>
                                    <InputMask
                                        ref={phoneInputRef}
                                        mask="(__) _____-____"
                                        replacement={{ _: /\d/ }}
                                        value={phoneNumberInput}
                                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                                        className="form-control"
                                        placeholder="(99) 99999-9999"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPhoneModal(false)}>
                                    Cancelar
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handlePhoneNumberSubmit}>
                                    Enviar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

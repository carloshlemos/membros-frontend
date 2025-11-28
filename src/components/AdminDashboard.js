import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalMembros, setTotalMembros] = useState(0);
    const [sortBy, setSortBy] = useState('nome');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchNome, setSearchNome] = useState('');
    const [filterNome, setFilterNome] = useState('');

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
                setError('Ocorreu um erro ao buscar os membros.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembros();
    }, [currentPage, itemsPerPage, sortBy, sortOrder, filterNome]);

    const generateToken = async (membroId) => {
        try {
            const response = await axios.post(`/membros/${membroId}/token`);
            const token = response.data.access_token;
            const link = `${window.location.origin}/update-member?token=${token}`;
            setGeneratedLink(link);
        } catch (err) {
            setError('Ocorreu um erro ao gerar o token.');
            console.error(err);
        }
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

            {error && <div className="alert alert-danger">{error}</div>}

            {generatedLink && (
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">Link de Atualização Gerado</h5>
                        <div className="input-group">
                            <input
                                type="text"
                                readOnly
                                className="form-control"
                                value={generatedLink}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedLink);
                                    alert('Link copiado!');
                                }}
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membros.map((membro) => (
                            <tr key={membro.id}>
                                <td>{membro.nome || 'N/A'}</td>
                                <td>{membro.email || 'N/A'}</td>
                                <td>{membro.celular || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => generateToken(membro.id)}
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
        </div>
    );
};

export default AdminDashboard;

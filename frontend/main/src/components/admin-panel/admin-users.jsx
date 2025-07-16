// src/components/admin/admin-users.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaSave, FaTimes, FaTrash, FaSearch, FaSort, FaExclamationCircle } from 'react-icons/fa';

const UserRole = {
	USER: 'user',
	ADMIN: 'admin'
};

const AdminUsersTable = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [skip, setSkip] = useState(0);
	const [limit, setLimit] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [editingUser, setEditingUser] = useState(null);
	const [tempRoles, setTempRoles] = useState([]);
	const [deletingUser, setDeletingUser] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortConfig, setSortConfig] = useState({
		key: 'email',
		direction: 'ascending'
	});

	useEffect(() => {
		fetchUsers();
	}, [skip, limit, searchTerm, sortConfig]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {
				skip,
				limit,
			};

			if (searchTerm) {
				params.query = searchTerm;
			}

			const response = await axios.get('/api/auth/admin/users', { params });

			// Sort the users based on sortConfig
			const sortedUsers = [...response.data.users].sort((a, b) => {
				const aValue = a[sortConfig.key] || '';
				const bValue = b[sortConfig.key] || '';

				if (aValue < bValue) {
					return sortConfig.direction === 'ascending' ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === 'ascending' ? 1 : -1;
				}
				return 0;
			});

			setUsers(sortedUsers);
			console.log(sortedUsers);
			setTotalCount(response.data.count);
		} catch (err) {
			handleApiError(err, 'Ошибка при загрузке пользователей');
		} finally {
			setLoading(false);
		}
	};

	const handleApiError = (error, defaultMessage) => {
		console.error(error);

		if (error.response) {
			// Обработка ошибок от API
			const { data, status } = error.response;

			if (data.message) {
				// Если сообщение - массив, объединяем его
				const errorMessage = Array.isArray(data.message)
					? data.message.join('. ')
					: data.message;

				setError({
					title: `Ошибка ${status}`,
					message: errorMessage,
					type: 'error'
				});
			} else {
				setError({
					title: `Ошибка ${status}`,
					message: defaultMessage,
					type: 'error'
				});
			}
		} else if (error.request) {
			// Ошибка сети или сервер не ответил
			setError({
				title: 'Ошибка сети',
				message: 'Не удалось соединиться с сервером. Проверьте подключение к интернету.',
				type: 'network'
			});
		} else {
			// Другие ошибки
			setError({
				title: 'Ошибка',
				message: defaultMessage,
				type: 'error'
			});
		}
	};

	const clearError = () => {
		setError(null);
	};

	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	const startEditing = (email, roles) => {
		setEditingUser(email);
		setTempRoles([...roles]);
		clearError();
	};

	const cancelEditing = () => {
		setEditingUser(null);
	};

	const handleRoleChange = (role, isChecked) => {
		if (isChecked) {
			setTempRoles([...tempRoles, role]);
		} else {
			setTempRoles(tempRoles.filter(r => r !== role));
		}
	};

	const saveChanges = async (email) => {
		try {
			setError(null);
			await axios.put(`/api/auth/admin/users/role/${email}`, {
				roles: tempRoles
			});
			fetchUsers();
			setEditingUser(null);
		} catch (err) {
			handleApiError(err, 'Ошибка при обновлении ролей');
		}
	};

	const confirmDelete = (email) => {
		setDeletingUser(email);
		clearError();
	};

	const cancelDelete = () => {
		setDeletingUser(null);
	};

	const deleteUser = async () => {
		try {
			setError(null);
			await axios.delete(`/api/auth/admin/users/${deletingUser}`);
			fetchUsers();
			setDeletingUser(null);
		} catch (err) {
			handleApiError(err, 'Ошибка при удалении пользователя');
		}
	};

	const getSortIcon = (key) => {
		if (sortConfig.key !== key) return null;
		return (
			<span className="ml-1">
				{sortConfig.direction === 'ascending' ? '↑' : '↓'}
			</span>
		);
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setSkip(0);
	};

	return (
		<div className="overflow-x-auto pl-2 pt-2">
			{loading && <div className="text-center py-4">Загрузка...</div>}

			{/* Отображение ошибок */}
			{error && (
				<div className={`mb-4 p-4 rounded-lg ${error.type === 'network' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
					}`}>
					<div className="flex items-center">
						<FaExclamationCircle className="mr-2 flex-shrink-0" />
						<div>
							<h3 className="font-medium">{error.title}</h3>
							<p>{error.message}</p>
							<button
								onClick={clearError}
								className="mt-2 text-sm underline hover:no-underline"
							>
								Закрыть
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Search */}
			<div className="mb-4">
				<div className="relative flex-grow max-w-md">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<FaSearch />
					</div>
					<input
						type="text"
						placeholder="Поиск по email..."
						value={searchTerm}
						onChange={handleSearch}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
					/>
				</div>
			</div>

			{/* Delete confirmation modal */}
			{deletingUser && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
						<h3 className="text-lg font-medium mb-4">Подтверждение удаления</h3>
						<p>Вы уверены, что хотите удалить пользователя {deletingUser}?</p>
						{error && (
							<div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
								{error.message}
							</div>
						)}
						<div className="flex justify-end space-x-3 mt-4">
							<button
								onClick={cancelDelete}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
							>
								Отмена
							</button>
							<button
								onClick={deleteUser}
								className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Удалить
							</button>
						</div>
					</div>
				</div>
			)}

			<table className="min-w-full bg-white rounded-lg overflow-hidden">
				<thead className="bg-gray-100">
					<tr>
						<th
							className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
							onClick={() => requestSort('email')}
						>
							<div className="flex items-center">
								Email
								{getSortIcon('email')}
							</div>
						</th>
						<th
							className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
							onClick={() => requestSort('_id')}
						>
							<div className="flex items-center">
								UID
								{getSortIcon('_id')}
							</div>
						</th>

						<th
							className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
							onClick={() => requestSort('createdAt')}
						>
							<div className="flex items-center">
								Дата создания
								{getSortIcon('createdAt')}
							</div>
						</th>
						<th
							className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
							onClick={() => requestSort('updatedAt')}
						>
							<div className="flex items-center">
								Дата обновления
								{getSortIcon('updatedAt')}
							</div>
						</th>
						<th
							className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
							onClick={() => requestSort('roles')}
						>
							<div className="flex items-center">
								Роли
								{getSortIcon('roles')}
							</div>
						</th>
						<th className="py-3 px-4 text-left">Действия</th>
					</tr>
				</thead>
				<tbody>
					{users.length > 0 ? (
						users.map((user) => (
							<tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
								<td className="py-3 px-4">{user.email}</td>
								<td className="py-3 px-4 font-mono text-sm text-gray-700">{user?.UID}</td>
								<td className="py-3 px-4">{new Date(user.createdAt).toLocaleString()}</td>
								<td className="py-3 px-4">{new Date(user.updatedAt).toLocaleString()}</td>
								<td className="py-3 px-4">
									{editingUser === user.email ? (
										<div className="flex flex-wrap gap-4">
											{Object.values(UserRole).map((role) => (
												<label key={role} className="flex items-center space-x-2">
													<input
														type="checkbox"
														checked={tempRoles.includes(role)}
														onChange={(e) => handleRoleChange(role, e.target.checked)}
														className="rounded text-blue-500"
													/>
													<span className="capitalize">{role}</span>
												</label>
											))}
										</div>
									) : (
										<div className="flex flex-wrap gap-2">
											{user.roles.map((role) => (
												<span
													key={role}
													className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs capitalize"
												>
													{role}
												</span>
											))}
										</div>
									)}
								</td>
								<td className="py-3 px-4">
									<div className="flex space-x-2">
										{editingUser === user.email ? (
											<>
												<button
													onClick={() => saveChanges(user.email)}
													className="p-1 text-green-600 hover:text-green-800"
													title="Сохранить"
												>
													<FaSave />
												</button>
												<button
													onClick={cancelEditing}
													className="p-1 text-red-600 hover:text-red-800"
													title="Отменить"
												>
													<FaTimes />
												</button>
											</>
										) : (
											<button
												onClick={() => startEditing(user.email, user.roles)}
												className="p-1 text-blue-600 hover:text-blue-800"
												title="Редактировать"
											>
												<FaEdit />
											</button>
										)}
										<button
											onClick={() => confirmDelete(user.email)}
											className="p-1 text-red-600 hover:text-red-800"
											title="Удалить"
										>
											<FaTrash />
										</button>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan="6" className="py-4 text-center text-gray-500">
								{searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
							</td>

						</tr>
					)}
				</tbody>
			</table>

			<div className="flex justify-between items-center mt-4">
				<div>
					<select
						value={limit}
						onChange={(e) => {
							setLimit(Number(e.target.value));
							setSkip(0);
						}}
						className="border rounded px-2 py-1"
					>
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
					<span className="ml-2">пользователей на странице</span>
				</div>
				<div className="flex items-center space-x-4">
					<span>
						Показано {skip + 1}-{Math.min(skip + limit, totalCount)} из {totalCount}
					</span>
					<div className="flex space-x-2">
						<button
							onClick={() => setSkip(Math.max(0, skip - limit))}
							disabled={skip === 0}
							className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
						>
							Назад
						</button>
						<button
							onClick={() => setSkip(skip + limit)}
							disabled={skip + limit >= totalCount}
							className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
						>
							Вперед
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminUsersTable;
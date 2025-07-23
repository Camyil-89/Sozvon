// src/components/admin/admin-users.jsx
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
	FaEdit,
	FaSave,
	FaTimes,
	FaTrash,
	FaSearch,
	FaSort,
	FaExclamationCircle,
	FaChevronLeft,
	FaChevronRight
} from 'react-icons/fa';

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
			const params = { skip, limit };

			if (searchTerm) params.query = searchTerm;

			const response = await axios.get('/api/auth/admin/users', { params });

			const sortedUsers = [...response.data.users].sort((a, b) => {
				const aValue = a[sortConfig.key] || '';
				const bValue = b[sortConfig.key] || '';

				if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
				if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
				return 0;
			});

			setUsers(sortedUsers);
			setTotalCount(response.data.count);
		} catch (err) {
			handleApiError(err, 'Ошибка при загрузке пользователей');
		} finally {
			setLoading(false);
		}
	};

	const handleApiError = (error, defaultMessage) => {
		console.error(error);

		let errorData = {
			title: 'Ошибка',
			message: defaultMessage,
			type: 'error'
		};

		if (error.response) {
			const { data, status } = error.response;
			errorData.title = `Ошибка ${status}`;
			errorData.message = Array.isArray(data.message)
				? data.message.join('. ')
				: data.message || defaultMessage;
		} else if (error.request) {
			errorData = {
				title: 'Ошибка сети',
				message: 'Не удалось соединиться с сервером. Проверьте подключение.',
				type: 'network'
			};
		}

		setError(errorData);
	};

	const requestSort = (key) => {
		setSortConfig({
			key,
			direction: sortConfig.key === key && sortConfig.direction === 'ascending'
				? 'descending'
				: 'ascending'
		});
	};

	const startEditing = (email, roles) => {
		setEditingUser(email);
		setTempRoles([...roles]);
		setError(null);
	};

	const handleRoleChange = (role, isChecked) => {
		setTempRoles(prev =>
			isChecked ? [...prev, role] : prev.filter(r => r !== role)
		);
	};

	const saveChanges = async (email) => {
		try {
			await axios.put(`/api/auth/admin/users/role/${email}`, { roles: tempRoles });
			fetchUsers();
			setEditingUser(null);
		} catch (err) {
			handleApiError(err, 'Ошибка при обновлении ролей');
		}
	};

	const deleteUser = async () => {
		try {
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

	return (
		<div className="p-4 bg-white rounded-lg shadow">
			{/* Заголовок и поиск */}
			<div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<h1 className="text-2xl font-bold text-gray-800">Управление пользователями</h1>

				<div className="relative w-full md:w-64">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<FaSearch className="text-gray-400" />
					</div>
					<input
						type="text"
						placeholder="Поиск по email..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setSkip(0);
						}}
						className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* Состояние загрузки */}
			{loading && (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			)}

			{/* Отображение ошибок */}
			{error && (
				<div className={`mb-6 p-4 rounded-lg flex items-start ${error.type === 'network'
					? 'bg-yellow-50 text-yellow-800'
					: 'bg-red-50 text-red-800'
					}`}>
					<FaExclamationCircle className="mt-1 mr-3 flex-shrink-0" />
					<div>
						<h3 className="font-medium">{error.title}</h3>
						<p className="mt-1">{error.message}</p>
						<button
							onClick={() => setError(null)}
							className="mt-2 text-sm text-blue-600 hover:text-blue-800"
						>
							Закрыть
						</button>
					</div>
				</div>
			)}

			{/* Таблица */}
			<div className="overflow-x-auto rounded-lg border border-gray-200">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{['email', 'UID', 'createdAt', 'updatedAt', 'roles'].map((key) => (
								<th
									key={key}
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
									onClick={() => requestSort(key)}
								>
									<div className="flex items-center">
										{{
											email: 'Email',
											UID: 'UID',
											createdAt: 'Дата создания',
											updatedAt: 'Дата обновления',
											roles: 'Роли'
										}[key]}
										{getSortIcon(key)}
									</div>
								</th>
							))}
							<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
								Действия
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.length > 0 ? (
							users.map((user) => (
								<tr key={user._id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{user.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
										{user.UID}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(user.createdAt).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(user.updatedAt).toLocaleString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingUser === user.email ? (
											<div className="flex flex-wrap gap-4">
												{Object.values(UserRole).map((role) => (
													<label key={role} className="inline-flex items-center">
														<input
															type="checkbox"
															checked={tempRoles.includes(role)}
															onChange={(e) => handleRoleChange(role, e.target.checked)}
															className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
														/>
														<span className="ml-2 text-sm text-gray-700 capitalize">
															{role}
														</span>
													</label>
												))}
											</div>
										) : (
											<div className="flex flex-wrap gap-2">
												{user.roles.map((role) => (
													<span
														key={role}
														className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
														style={{
															backgroundColor: role === 'admin'
																? '#EFF6FF'
																: '#F3F4F6',
															color: role === 'admin'
																? '#1D4ED8'
																: '#4B5563'
														}}
													>
														{role}
													</span>
												))}
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											{editingUser === user.email ? (
												<>
													<button
														onClick={() => saveChanges(user.email)}
														className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50"
														title="Сохранить"
													>
														<FaSave />
													</button>
													<button
														onClick={() => setEditingUser(null)}
														className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
														title="Отменить"
													>
														<FaTimes />
													</button>
												</>
											) : (
												<button
													onClick={() => startEditing(user.email, user.roles)}
													className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50"
													title="Редактировать"
												>
													<FaEdit />
												</button>
											)}
											<button
												onClick={() => setDeletingUser(user.email)}
												className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
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
								<td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
									{searchTerm ? 'Пользователи не найдены' : 'Нет пользователей'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Пагинация */}
			<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center">
					<span className="text-sm text-gray-700 mr-2">Показать:</span>
					<select
						value={limit}
						onChange={(e) => {
							setLimit(Number(e.target.value));
							setSkip(0);
						}}
						className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
					>
						{[10, 25, 50, 100].map((size) => (
							<option key={size} value={size}>{size}</option>
						))}
					</select>
				</div>

				<div className="flex items-center space-x-4">
					<span className="text-sm text-gray-700">
						{skip + 1}-{Math.min(skip + limit, totalCount)} из {totalCount}
					</span>
					<div className="flex space-x-1">
						<button
							onClick={() => setSkip(Math.max(0, skip - limit))}
							disabled={skip === 0}
							className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						>
							<FaChevronLeft className="h-4 w-4" />
						</button>
						<button
							onClick={() => setSkip(skip + limit)}
							disabled={skip + limit >= totalCount}
							className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						>
							<FaChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Модальное окно удаления */}
			{deletingUser && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full">
						<div className="p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
							<p className="text-gray-600 mb-6">
								Вы уверены, что хотите удалить пользователя <span className="font-medium">{deletingUser}</span>? Это действие нельзя отменить.
							</p>

							{error && (
								<div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
									{error.message}
								</div>
							)}

							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setDeletingUser(null)}
									className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									Отмена
								</button>
								<button
									onClick={deleteUser}
									className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									Удалить
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUsersTable;
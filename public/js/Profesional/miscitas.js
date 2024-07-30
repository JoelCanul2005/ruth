document.addEventListener('DOMContentLoaded', () => {
    let citas = [];

    const obtenerCitas = async () => {
        let claveAutorizacion = localStorage.getItem('claveAutorizacionProfesional');

        if (!claveAutorizacion) {
            claveAutorizacion = prompt('Introduce tu clave de autorización');
            if (!claveAutorizacion) {
                alert('La clave de autorización es necesaria');
                return;
            }
            localStorage.setItem('claveAutorizacionProfesional', claveAutorizacion);
        }

        try {
            const response = await fetch('/api/obtener-profesional', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ claveAutorizacion })
            });

            const data = await response.json();
            if (data.success) {
                citas = data.citas;
                mostrarCitas(citas);
            } else {
                console.error('Error al obtener citas:', data.error);
            }
        } catch (error) {
            console.error('Error al obtener citas:', error);
        }
    };

    const mostrarCitas = (citas) => {
        const tbody = document.querySelector('#citasTable tbody');
        tbody.innerHTML = '';

        citas.forEach(cita => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cita.clienteNombre} ${cita.clienteSNombre} ${cita.clienteApellido} ${cita.clienteSApellido}</td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.motivo}</td>
                <td>${cita.estado}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.cancelarCita = async (citaId) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            try {
                const response = await fetch('/api/citas/cancelar-profesional', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ citaId })
                });

                const data = await response.json();
                if (data.success) {
                    mostrarModal('Cita cancelada exitosamente');
                    obtenerCitas();
                } else {
                    mostrarModal(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error('Error al cancelar la cita:', error);
            }
        }
    };

    const mostrarModal = (mensaje) => {
        const modal = document.getElementById('modal');
        const modalMessage = document.getElementById('modalMessage');
        const closeModal = document.getElementById('closeModal');

        modalMessage.textContent = mensaje;
        modal.style.display = 'block';

        closeModal.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    };

    const aplicarFiltros = () => {
        const filtroCliente = document.getElementById('filtroCliente').value.toLowerCase();
        const filtroFecha = document.getElementById('filtroFecha').value;
        const filtroEstado = document.getElementById('filtroEstado').value;
        const filtroCercania = document.getElementById('filtroCercania').checked;

        const fechaFiltro = filtroFecha ? new Date(filtroFecha) : null;

        const citasFiltradas = citas.filter(cita => {
            const nombreCompleto = `${cita.clienteNombre} ${cita.clienteSNombre} ${cita.clienteApellido} ${cita.clienteSApellido}`.toLowerCase();
            const coincideCliente = !filtroCliente || nombreCompleto.includes(filtroCliente);

            const fechaCita = new Date(cita.fecha);
            const coincideFecha = !fechaFiltro || fechaCita.toISOString().split('T')[0] === fechaFiltro.toISOString().split('T')[0];

            const coincideEstado = !filtroEstado || cita.estado === filtroEstado;

            const hoy = new Date();
            const sieteDiasDespues = new Date();
            sieteDiasDespues.setDate(hoy.getDate() + 7);
            const esCercana = !filtroCercania || (cita.estado === 'confirmada' && fechaCita >= hoy && fechaCita <= sieteDiasDespues);

            return coincideCliente && coincideFecha && coincideEstado && esCercana;
        });

        mostrarCitas(citasFiltradas);
    };

    document.getElementById('filtroCliente').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroFecha').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroCercania').addEventListener('change', aplicarFiltros);

    obtenerCitas();
});

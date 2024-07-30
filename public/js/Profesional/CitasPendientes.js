document.addEventListener('DOMContentLoaded', loadCitasPendientes);

function loadCitasPendientes() {
    const claveAutorizacionProfesional = localStorage.getItem('claveAutorizacionProfesional');

    if (!claveAutorizacionProfesional) {
        console.error('Clave de autorización no proporcionada');
        return;
    }

    fetch('/api/citas/pendientes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey: claveAutorizacionProfesional })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }

        const citas = data.citas;
        const tableBody = document.querySelector('#citasTable tbody');
        tableBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevas filas

        citas.forEach(cita => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cita.motivo}</td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.estado}</td>
                <td><button class="btn btn-primary" onclick="verDetalles(${cita.id})">Ver detalles</button></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error al obtener citas pendientes:', error);
    });
}

function verDetalles(citaId) {
    const claveAutorizacionProfesional = localStorage.getItem('claveAutorizacionProfesional');

    fetch(`/api/citas/detalles/${citaId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'clave-autorizacion-profesional': claveAutorizacionProfesional
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }

        const cita = data.cita;
        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <p><strong>Motivo:</strong> ${cita.motivo}</p>
            <p><strong>Fecha:</strong> ${cita.fecha}</p>
            <p><strong>Hora:</strong> ${cita.hora}</p>
            <p><strong>Estado:</strong> ${cita.estado}</p>
            <p><strong>Nombre de Paciente:</strong> ${cita.nombre} ${cita.snombre} ${cita.apellido} ${cita.sapellido}</p>
        `;

        // Mostrar el modal
        $('#detailsModal').modal('show');

        document.getElementById('aceptarButton').onclick = () => actualizarEstadoCita(cita.id, 'confirmada');
        document.getElementById('cancelarButton').onclick = () => actualizarEstadoCita(cita.id, 'cancelada');
    })
    .catch(error => {
        console.error('Error al obtener detalles de la cita:', error);
    });
}

function actualizarEstadoCita(citaId, nuevoEstado) {
    const claveAutorizacionProfesional = localStorage.getItem('claveAutorizacionProfesional');

    fetch(`/api/citas/actualizar/${citaId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey: claveAutorizacionProfesional, nuevoEstado })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Error desconocido');
        }
        loadCitasPendientes();
        $('#detailsModal').modal('hide'); // Cerrar el modal
    })
    .catch(error => {
        console.error('Error al actualizar estado de la cita:', error);
    });
}

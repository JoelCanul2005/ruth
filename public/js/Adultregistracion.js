document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    document.getElementById('userId').value = userId;

    var form = document.getElementById('adultosregis');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        var formData = new FormData(form);
        var data = {};
        formData.forEach((value, key) => data[key] = value);

        fetch('/api/registro-adulto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // Si la respuesta no es 'ok', lanza un error
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Datos del Tutor registrados correctamente');
            } else {
                alert('Error registrando datos del Tutor');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al registrar los datos del tutor. Por favor, intenta nuevamente.');
        });
    });
});

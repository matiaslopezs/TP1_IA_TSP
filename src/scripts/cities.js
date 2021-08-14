const cities = [
    'Concepción,-23.4228666,-57.4692221',
    'Santa Fe del Paraná,-25.2048904,-54.786378',
    'Mbaracayú,-25.0287998,-54.8327207',
    'Los Cedrales,-25.6725024,-54.8853517',
    'San Alberto,-24.9734912,-54.9354389',
    'Yguazú,-25.3645131,-56.0793931',
    'Mayor Pablo Lagerenza,-19.9235277,-60.7860232',
    'Puerto Guaraní,-21.2850451,-57.9418882',
    'Bahía Negra,-20.242547,-58.1880572',
    'La Victoria,-22.2861972,-57.952087',
    'Asunción,-25.296836,-57.6683014',
    'San Lorenzo,-25.3537446,-57.5891332',
    'Luque,-25.255595,-57.5061812',
    'Ciudad del Este,-25.4933397,-54.8121001',
    'Caacupé,-25.3887416,-57.1823938',
    'Fernando de la Mora,-25.3251631,-57.5877123',
    'Areguá,-25.3031402,-57.4380478',
    'Villa Rica,-25.7811372,-56.4786108',
    'Encarnación,-27.2960557,-56.037666',
    'Coronel Oviedo,-25.413734,-56.5977973',
    'Lambaré,-25.3512612,-57.6479068',
    'Limpio,-25.1586049,-57.5325516',
    'Capiatá,-25.3712196,-57.5278394',
    'Villa Elisa,-25.3684736,-57.6251581',
    'Mariano Roque Alonzo,-25.1902103,-57.5691428',
    'Itaguá,-25.4090785,-57.4411718',
    'Fuerte Olimpo,-21.0443707,-57.8961899',
    'Salto delGuairá,-24.0678338,-54.3517477',
    'Ñemby,-25.4011179,-57.5728101',
    'Hernandarias,-25.4077991,-54.6769817',
    'San Bernardino,-25.3125776,-57.3588495',
    'Ypacaraí,-25.4048761,-57.3052282',
    'Villa Hayes,-24.2042238,-59.4073765',
    'Ayolas,-27.3841656,-56.8699232',
    'San Juan Bautista,-26.6684355,-57.1585181',
    'Pedro Juan Caballero,-22.5552533,-55.7638712',
    'Itá,-25.5053864,-57.382662',
    'Pilar,-26.8643553,-58.3476408',
    'Presidente Franco,-25.6027564,-54.7083977',
    'Ybycuí,-26.0229078,-57.0272184',
    'Minga Guazú,-25.5052766,-54.9849608',
    'Yaguarón,-25.5636569,-57.3044731',
    'Piribebuy,-25.4646877,-57.0543896',
    'Coronel Bogado,-27.1598573,-56.2574352',
    'Emboscada,-25.1206399,-57.3634192',
    'San Antonio,-25.4187378,-57.599037',
    'Humaitá,-27.0675709,-58.5164024',
    'Guarambaré,-25.4897603,-57.485956',
    'Horqueta,-23.3470611,-57.0734169',
    'Capitán Bado,-23.2744228,-55.5596426',
    'Tobatí,-25.2656799,-57.1048626',
    'Pirayu,-25.484655,-57.2452713'
];

export const shuffledCities = () => {
    let array = [...cities.map(c => { const arr = c.split(','); return { name: arr[0], lat: arr[1], lng: arr[2] } })];
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
};

export default cities;
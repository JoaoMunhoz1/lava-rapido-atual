document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ==================================================
        // SUPABASE
        // ==================================================

        const SUPABASE_URL =
            "https://zmjrwoffngbilbavdzwt.supabase.co";


        const SUPABASE_PUBLISHABLE_KEY =
            "sb_publishable_YgKjSlZLARWYiTaTYLIRqg_-V3sv4Dt";


        const supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        console.log(
            "✅ Supabase inicializado."
        );


        // ==================================================
        // SERVIÇOS
        // ==================================================

        const SERVICES = [

            {
                id:
                    "moto",

                name:
                    "Lavagem Moto",

                price:
                    "R$ 25,00",

                items: [
                    "Lavagem Completa"
                ]
            },


            {
                id:
                    "simples",

                name:
                    "Lavagem Simples",

                price:
                    "R$ 50,00",

                items: [
                    "Lavagem externa",
                    "Limpeza das rodas",
                    "Aspiração interna",
                    "Limpeza do painel",
                    "Limpeza dos vidros"
                ]
            },


            {
                id:
                    "completa",

                name:
                    "Lavagem Completa",

                price:
                    "R$ 85,00",

                items: [
                    "Tudo da Lavagem Simples",
                    "Limpeza detalhada do interior",
                    "Limpeza de cantos e acabamentos",
                    "Pretinho nos pneus",
                    "Acabamento externo",
                    "Finalização Completa"
                ]
            }

        ];


        // ==================================================
        // HORÁRIOS
        // ==================================================

        const HOURS = [

            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
            "19:00"

        ];


        // ==================================================
        // ESTADO
        // ==================================================

        let selectedService =
            null;


        let selectedSlot =
            null;


        // ==================================================
        // ELEMENTOS DO HTML
        // ==================================================

        const servicesEl =
            document.getElementById(
                "services"
            );


        const selectedServiceMsg =
            document.getElementById(
                "selectedServiceMsg"
            );


        const dateInput =
            document.getElementById(
                "date"
            );


        const openCalendarBtn =
            document.getElementById(
                "openCalendarBtn"
            );


        const closeCalendarBtn =
            document.getElementById(
                "closeCalendarBtn"
            );


        const calendarModal =
            document.getElementById(
                "calendarModal"
            );


        const calendarOverlay =
            document.getElementById(
                "calendarOverlay"
            );


        const calendarDays =
            document.getElementById(
                "calendarDays"
            );


        const calendarTriggerText =
            document.getElementById(
                "calendarTriggerText"
            );


        const slotsEl =
            document.getElementById(
                "slots"
            );


        const agendaEl =
            document.getElementById(
                "agendaList"
            );


        const confirmButton =
            document.getElementById(
                "confirmBtn"
            );


        const nameInput =
            document.getElementById(
                "name"
            );


        const phoneInput =
            document.getElementById(
                "phone"
            );


        const vehicleInput =
            document.getElementById(
                "vehicle"
            );


        const notesInput =
            document.getElementById(
                "notes"
            );


        const formMessage =
            document.getElementById(
                "formMsg"
            );


        const ticket =
            document.getElementById(
                "ticket"
            );


        const ticketService =
            document.getElementById(
                "tService"
            );


        const ticketDate =
            document.getElementById(
                "tDate"
            );


        const ticketTime =
            document.getElementById(
                "tTime"
            );


        const ticketName =
            document.getElementById(
                "tName"
            );


        const ticketPhone =
            document.getElementById(
                "tPhone"
            );


        const ticketVehicle =
            document.getElementById(
                "tVehicle"
            );


        const ticketNotes =
            document.getElementById(
                "tNotes"
            );


        const customerWhatsAppBtn =
            document.getElementById(
                "customerWhatsAppBtn"
            );


        const newBookingButton =
            document.getElementById(
                "newBookingBtn"
            );


        // ==================================================
        // PROTEÇÃO
        // ==================================================

        if (
            !servicesEl ||
            !selectedServiceMsg ||
            !dateInput ||
            !openCalendarBtn ||
            !closeCalendarBtn ||
            !calendarModal ||
            !calendarOverlay ||
            !calendarDays ||
            !calendarTriggerText ||
            !slotsEl ||
            !agendaEl ||
            !confirmButton ||
            !nameInput ||
            !phoneInput ||
            !vehicleInput ||
            !notesInput
        ) {

            console.error(
                "Algum elemento necessário não foi encontrado no HTML."
            );

            return;
        }


        // ==================================================
        // FUNÇÕES SUPABASE
        // ==================================================

        async function getOccupiedTimes(
            date
        ) {

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.rpc(
                        "get_horarios_ocupados",
                        {
                            p_data:
                                date
                        }
                    );


                if (
                    error
                ) {

                    console.error(
                        "Erro ao consultar horários:",
                        error
                    );

                    throw error;
                }


                if (
                    !Array.isArray(
                        data
                    )
                ) {

                    return [];
                }


                return data
                    .map(
                        item =>
                            item.horario
                    )
                    .filter(
                        Boolean
                    );


            } catch (
                error
            ) {

                console.error(
                    "Falha na comunicação com o banco:",
                    error
                );


                return [];
            }
        }


        async function createBookingInDatabase(
            booking
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "agendamentos"
                    )
                    .insert(
                        [
                            {
                                data:
                                    booking.date,

                                horario:
                                    booking.time,

                                servico:
                                    booking.serviceName,

                                nome:
                                    booking.name,

                                telefone:
                                    booking.phone,

                                veiculo:
                                    booking.vehicle,

                                observacoes:
                                    booking.notes || null,

                                concluido:
                                    false
                            }
                        ]
                    );


            if (
                error
            ) {

                throw error;
            }


            return data;
        }


        // ==================================================
        // CARDS DOS SERVIÇOS
        // ==================================================

        SERVICES.forEach(
            service => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "service-card";


                card.dataset.id =
                    service.id;


                card.innerHTML = `

                    <h3>
                        ${service.name}
                    </h3>

                    <div class="price mono">
                        ${service.price}
                    </div>

                    <ul class="service-items">

                        ${service.items
                            .map(
                                item =>
                                    `<li>✓ ${item}</li>`
                            )
                            .join("")
                        }

                    </ul>

                `;


                card.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".service-card"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "selected"
                                    );

                                }
                            );


                        card.classList.add(
                            "selected"
                        );


                        selectedService =
                            service;


                        selectedServiceMsg.textContent =
                            `✓ ${service.name} selecionada — ${service.price}`;

                    }
                );


                servicesEl.appendChild(
                    card
                );

            }
        );


        // ==================================================
        // DATAS
        // ==================================================

        function formatDate(
            date
        ) {

            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            return (
                `${year}-${month}-${day}`
            );
        }


        function formatDatePtBr(
            dateString
        ) {

            if (
                !dateString
            ) {

                return "";
            }


            return dateString
                .split(
                    "-"
                )
                .reverse()
                .join(
                    "/"
                );
        }


        const today =
            new Date();


        today.setHours(
            12,
            0,
            0,
            0
        );


        const maximumDate =
            new Date(
                today
            );


        maximumDate.setDate(
            maximumDate.getDate() + 30
        );


        // ==================================================
        // CALENDÁRIO
        // ==================================================

        function openCalendar() {

            renderCalendar();


            calendarModal.classList.add(
                "show"
            );


            calendarModal.setAttribute(
                "aria-hidden",
                "false"
            );


            document.body.classList.add(
                "calendar-open"
            );
        }


        function closeCalendar() {

            calendarModal.classList.remove(
                "show"
            );


            calendarModal.setAttribute(
                "aria-hidden",
                "true"
            );


            document.body.classList.remove(
                "calendar-open"
            );
        }


        function renderCalendar() {

            calendarDays.innerHTML =
                "";


            const startDate =
                new Date(
                    today
                );


            const endDate =
                new Date(
                    maximumDate
                );


            const jsDay =
                startDate.getDay();


            const mondayOffset =
                (
                    jsDay + 6
                ) % 7;


            for (
                let i = 0;
                i < mondayOffset;
                i++
            ) {

                const spacer =
                    document.createElement(
                        "div"
                    );


                spacer.className =
                    "calendar-spacer";


                calendarDays.appendChild(
                    spacer
                );
            }


            const current =
                new Date(
                    startDate
                );


            while (
                current <= endDate
            ) {

                const dateValue =
                    formatDate(
                        current
                    );


                const dayOfWeek =
                    current.getDay();


                const isSunday =
                    dayOfWeek === 0;


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "calendar-day";


                button.dataset.date =
                    dateValue;


                if (
                    isSunday
                ) {

                    button.classList.add(
                        "disabled"
                    );


                    button.disabled =
                        true;
                }


                if (
                    dateInput.value ===
                    dateValue
                ) {

                    button.classList.add(
                        "selected"
                    );
                }


                const weekday =
                    new Intl.DateTimeFormat(
                        "pt-BR",
                        {
                            weekday:
                                "short"
                        }
                    )
                        .format(
                            current
                        )
                        .replace(
                            ".",
                            ""
                        );


                const dayNumber =
                    String(
                        current.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                button.innerHTML = `

                    <span
                        class="calendar-day-name"
                    >
                        ${weekday}
                    </span>

                    <strong>
                        ${dayNumber}
                    </strong>

                `;


                if (
                    !isSunday
                ) {

                    button.addEventListener(
                        "click",
                        async () => {

                            document
                                .querySelectorAll(
                                    ".calendar-day"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "selected"
                                        );

                                    }
                                );


                            button.classList.add(
                                "selected"
                            );


                            dateInput.value =
                                dateValue;


                            calendarTriggerText.textContent =
                                formatDatePtBr(
                                    dateValue
                                );


                            await renderSlots();


                            closeCalendar();

                        }
                    );
                }


                calendarDays.appendChild(
                    button
                );


                current.setDate(
                    current.getDate() + 1
                );
            }
        }


        openCalendarBtn.addEventListener(
            "click",
            openCalendar
        );


        closeCalendarBtn.addEventListener(
            "click",
            closeCalendar
        );


        calendarOverlay.addEventListener(
            "click",
            closeCalendar
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                        "Escape" &&

                    calendarModal
                        .classList
                        .contains(
                            "show"
                        )
                ) {

                    closeCalendar();
                }

            }
        );

                // ==================================================
        // AGENDA VISÍVEL PARA O CLIENTE
        // ==================================================

        function renderAgenda(
            occupiedTimes
        ) {

            agendaEl.innerHTML =
                "";


            if (
                !occupiedTimes ||
                occupiedTimes.length === 0
            ) {

                agendaEl.textContent =
                    "Nenhum agendamento ainda para este dia.";


                return;
            }


            occupiedTimes.forEach(
                hour => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "agenda-item";


                    item.innerHTML = `

                        <span class="t">
                            ${hour}
                        </span>

                        <span>
                            Horário reservado
                        </span>

                        <span>
                            Indisponível
                        </span>

                    `;


                    agendaEl.appendChild(
                        item
                    );

                }
            );
        }


        // ==================================================
        // VERIFICA SE O HORÁRIO JÁ PASSOU
        // ==================================================

        function isPastTime(
            date,
            hour
        ) {

            const todayString =
                formatDate(
                    new Date()
                );


            if (
                date !==
                todayString
            ) {

                return false;
            }


            const now =
                new Date();


            const [
                hours,
                minutes
            ] =
                hour
                    .split(
                        ":"
                    )
                    .map(
                        Number
                    );


            const slotDate =
                new Date();


            slotDate.setHours(
                hours,
                minutes,
                0,
                0
            );


            return (
                slotDate <= now
            );
        }


        // ==================================================
        // HORÁRIOS DISPONÍVEIS
        // ==================================================

        async function renderSlots() {

            const date =
                dateInput.value;


            if (
                !date
            ) {

                slotsEl.innerHTML = `

                    <div
                        class="slot-placeholder"
                    >
                        Escolha uma data para ver os horários.
                    </div>

                `;


                agendaEl.textContent =
                    "Escolha uma data para visualizar a agenda.";


                return;
            }


            slotsEl.innerHTML = `

                <div class="slot-placeholder">
                    Carregando horários...
                </div>

            `;


            agendaEl.textContent =
                "Carregando agenda...";


            selectedSlot =
                null;


            const occupiedTimes =
                await getOccupiedTimes(
                    date
                );


            slotsEl.innerHTML =
                "";


            HOURS.forEach(
                hour => {

                    const slot =
                        document.createElement(
                            "div"
                        );


                    const isTaken =
                        occupiedTimes.includes(
                            hour
                        );


                    const isPast =
                        isPastTime(
                            date,
                            hour
                        );


                    const unavailable =
                        isTaken ||
                        isPast;


                    slot.className =
                        unavailable
                            ? "slot taken"
                            : "slot";


                    slot.textContent =
                        hour;


                    if (
                        !unavailable
                    ) {

                        slot.tabIndex =
                            0;


                        function selectSlot() {

                            document
                                .querySelectorAll(
                                    ".slot"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "selected"
                                        );

                                    }
                                );


                            slot.classList.add(
                                "selected"
                            );


                            selectedSlot =
                                hour;
                        }


                        slot.addEventListener(
                            "click",
                            selectSlot
                        );


                        slot.addEventListener(
                            "keydown",
                            event => {

                                if (
                                    event.key ===
                                        "Enter" ||

                                    event.key ===
                                        " "
                                ) {

                                    event.preventDefault();


                                    selectSlot();
                                }

                            }
                        );
                    }


                    slotsEl.appendChild(
                        slot
                    );

                }
            );


            renderAgenda(
                occupiedTimes
            );
        }


        // ==================================================
        // MÁSCARA DE TELEFONE
        // ==================================================

        phoneInput.addEventListener(
            "input",
            () => {

                let value =
                    phoneInput
                        .value
                        .replace(
                            /\D/g,
                            ""
                        );


                value =
                    value.slice(
                        0,
                        11
                    );


                if (
                    value.length > 10
                ) {

                    value =
                        value.replace(
                            /(\d{2})(\d{5})(\d{4})/,
                            "($1) $2-$3"
                        );

                } else if (
                    value.length > 6
                ) {

                    value =
                        value.replace(
                            /(\d{2})(\d{4})(\d{0,4})/,
                            "($1) $2-$3"
                        );

                } else if (
                    value.length > 2
                ) {

                    value =
                        value.replace(
                            /(\d{2})(\d+)/,
                            "($1) $2"
                        );

                } else if (
                    value.length > 0
                ) {

                    value =
                        value.replace(
                            /(\d{0,2})/,
                            "($1"
                        );
                }


                phoneInput.value =
                    value;

            }
        );


        // ==================================================
        // MENSAGENS
        // ==================================================

        function showError(
            text
        ) {

            formMessage.textContent =
                text;


            formMessage.className =
                "msg err";
        }


        function showSuccess(
            text
        ) {

            formMessage.textContent =
                text;


            formMessage.className =
                "msg ok";
        }


        function clearMessage() {

            formMessage.textContent =
                "";


            formMessage.className =
                "msg";
        }


        // ==================================================
        // CONFIRMAR AGENDAMENTO
        // ==================================================

        confirmButton.addEventListener(
            "click",
            async () => {

                clearMessage();


                const name =
                    nameInput
                        .value
                        .trim();


                const phone =
                    phoneInput
                        .value
                        .trim();


                const vehicle =
                    vehicleInput
                        .value
                        .trim();


                const notes =
                    notesInput
                        .value
                        .trim();


                const date =
                    dateInput.value;


                // ==================================================
                // VALIDA SERVIÇO
                // ==================================================

                if (
                    !selectedService
                ) {

                    showError(
                        "Escolha um serviço."
                    );

                    return;
                }


                // ==================================================
                // VALIDA DATA
                // ==================================================

                if (
                    !date
                ) {

                    showError(
                        "Escolha uma data."
                    );

                    return;
                }


                // ==================================================
                // NÃO PERMITE DOMINGO
                // ==================================================

                const selectedDate =
                    new Date(
                        `${date}T12:00:00`
                    );


                if (
                    selectedDate.getDay() === 0
                ) {

                    showError(
                        "Não atendemos aos domingos."
                    );

                    return;
                }


                // ==================================================
                // VALIDA HORÁRIO
                // ==================================================

                if (
                    !selectedSlot
                ) {

                    showError(
                        "Escolha um horário disponível."
                    );

                    return;
                }


                // ==================================================
                // VALIDA NOME
                // ==================================================

                if (
                    !name
                ) {

                    showError(
                        "Informe seu nome."
                    );

                    return;
                }


                // ==================================================
                // VALIDA TELEFONE
                // ==================================================

                if (
                    !phone
                ) {

                    showError(
                        "Informe seu telefone."
                    );

                    return;
                }


                const phoneNumbers =
                    phone.replace(
                        /\D/g,
                        ""
                    );


                if (
                    phoneNumbers.length < 10
                ) {

                    showError(
                        "Informe um telefone válido."
                    );

                    return;
                }


                // ==================================================
                // VALIDA VEÍCULO
                // ==================================================

                if (
                    !vehicle
                ) {

                    showError(
                        "Informe o veículo ou modelo."
                    );

                    return;
                }


                // ==================================================
                // DESABILITA BOTÃO DURANTE ENVIO
                // ==================================================

                confirmButton.disabled =
                    true;


                const originalButtonText =
                    confirmButton.textContent;


                confirmButton.textContent =
                    "Salvando...";


                try {

                    // ==================================================
                    // CONFERE O HORÁRIO DE NOVO NO BANCO
                    // ==================================================

                    const occupiedTimes =
                        await getOccupiedTimes(
                            date
                        );


                    if (
                        occupiedTimes.includes(
                            selectedSlot
                        )
                    ) {

                        showError(
                            "Esse horário acabou de ser reservado. Escolha outro."
                        );


                        await renderSlots();


                        return;
                    }


                    // ==================================================
                    // MONTA AGENDAMENTO
                    // ==================================================

                    const booking = {

                        date:
                            date,

                        time:
                            selectedSlot,

                        serviceName:
                            selectedService.name,

                        name:
                            name,

                        phone:
                            phone,

                        vehicle:
                            vehicle,

                        notes:
                            notes

                    };


                    // ==================================================
                    // SALVA NO SUPABASE
                    // ==================================================

                    try {

                        await createBookingInDatabase(
                            booking
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "Erro ao salvar agendamento:",
                            error
                        );


                        // Violação da constraint unique(data, horario)

                        if (
                            error &&
                            error.code ===
                                "23505"
                        ) {

                            showError(
                                "Esse horário acabou de ser reservado por outra pessoa. Escolha outro."
                            );


                            await renderSlots();


                            return;
                        }


                        showError(
                            "Não foi possível salvar o agendamento. Tente novamente."
                        );


                        return;
                    }


                    // ==================================================
                    // PREPARA COMPROVANTE
                    // ==================================================

                    const formattedDate =
                        formatDatePtBr(
                            date
                        );


                    if (
                        ticketService
                    ) {

                        ticketService.textContent =
                            selectedService.name;
                    }


                    if (
                        ticketDate
                    ) {

                        ticketDate.textContent =
                            formattedDate;
                    }


                    if (
                        ticketTime
                    ) {

                        ticketTime.textContent =
                            selectedSlot;
                    }


                    if (
                        ticketName
                    ) {

                        ticketName.textContent =
                            name;
                    }


                    if (
                        ticketPhone
                    ) {

                        ticketPhone.textContent =
                            phone;
                    }


                    if (
                        ticketVehicle
                    ) {

                        ticketVehicle.textContent =
                            vehicle;
                    }


                    if (
                        ticketNotes
                    ) {

                        ticketNotes.textContent =
                            notes ||
                            "Nenhuma";
                    }


                    // ==================================================
                    // WHATSAPP
                    // ==================================================

                    if (
                        customerWhatsAppBtn
                    ) {

                        const whatsappNumber =
                            "5518997683525";


                        const whatsappMessage =
                            encodeURIComponent(

`Olá! Acabei de fazer um agendamento no Lava Rápido.

Serviço: ${selectedService.name}
Veículo: ${vehicle}
Data: ${formattedDate}
Horário: ${selectedSlot}
Nome: ${name}
Telefone: ${phone}
Observações: ${notes || "Nenhuma"}`

                            );


                        customerWhatsAppBtn.href =
                            `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
                    }


                    // ==================================================
                    // MOSTRA COMPROVANTE
                    // ==================================================

                    if (
                        ticket
                    ) {

                        ticket.classList.add(
                            "show"
                        );
                    }


                    showSuccess(
                        "Agendamento realizado com sucesso!"
                    );


                    // ==================================================
                    // LIMPA CAMPOS
                    // ==================================================

                    nameInput.value =
                        "";


                    phoneInput.value =
                        "";


                    vehicleInput.value =
                        "";


                    notesInput.value =
                        "";


                    // ==================================================
                    // ATUALIZA HORÁRIOS
                    // ==================================================

                    await renderSlots();


                } finally {

                    confirmButton.disabled =
                        false;


                    confirmButton.textContent =
                        originalButtonText;

                }

            }
        );

                // ==================================================
        // FAZER NOVO AGENDAMENTO
        // ==================================================

        if (
            newBookingButton
        ) {

            newBookingButton.addEventListener(
                "click",
                async () => {

                    // ESCONDE O COMPROVANTE

                    if (
                        ticket
                    ) {

                        ticket.classList.remove(
                            "show"
                        );
                    }


                    // REMOVE SERVIÇO SELECIONADO

                    document
                        .querySelectorAll(
                            ".service-card"
                        )
                        .forEach(
                            card => {

                                card.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    selectedService =
                        null;


                    selectedSlot =
                        null;


                    selectedServiceMsg.textContent =
                        "";


                    // LIMPA DATA

                    dateInput.value =
                        "";


                    calendarTriggerText.textContent =
                        "Escolher data";


                    // LIMPA CAMPOS

                    nameInput.value =
                        "";


                    phoneInput.value =
                        "";


                    vehicleInput.value =
                        "";


                    notesInput.value =
                        "";


                    // LIMPA MENSAGEM

                    clearMessage();


                    // VOLTA PARA ESTADO INICIAL

                    await renderSlots();


                    // VOLTA PARA SERVIÇOS

                    const servicesSection =
                        document.getElementById(
                            "servicos"
                        );


                    if (
                        servicesSection
                    ) {

                        servicesSection.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    }

                }
            );
        }


        // ==================================================
        // INICIALIZA O SITE
        // ==================================================

        dateInput.value =
            "";


        calendarTriggerText.textContent =
            "Escolher data";


        renderSlots();


    }
);
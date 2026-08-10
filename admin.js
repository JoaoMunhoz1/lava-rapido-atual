document.addEventListener(
    "DOMContentLoaded",
    async () => {

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


        // ==================================================
        // ELEMENTOS PRINCIPAIS
        // ==================================================

        const agendaEl =
            document.getElementById(
                "agenda"
            );

        const loggedUser =
            document.getElementById(
                "loggedUser"
            );

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );

        const filterDateInput =
            document.getElementById(
                "filterDate"
            );

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        const clearSearchBtn =
            document.getElementById(
                "clearSearchBtn"
            );

        const resultsCount =
            document.getElementById(
                "resultsCount"
            );


        const totalBookingsEl =
            document.getElementById(
                "totalBookings"
            );

        const todayBookingsEl =
            document.getElementById(
                "todayBookings"
            );

        const pendingTodayBookingsEl =
            document.getElementById(
                "pendingTodayBookings"
            );

        const pendingTodayCard =
            document.getElementById(
                "pendingTodayCard"
            );


        const filterBtn =
            document.getElementById(
                "filterBtn"
            );

        const todayBtn =
            document.getElementById(
                "todayBtn"
            );

        const tomorrowBtn =
            document.getElementById(
                "tomorrowBtn"
            );

        const clearFilterBtn =
            document.getElementById(
                "clearFilterBtn"
            );

        const refreshBtn =
            document.getElementById(
                "refreshBtn"
            );

        const statusButtons =
            document.querySelectorAll(
                ".status-btn"
            );


        // ==================================================
        // MODAL
        // ==================================================

        const editModal =
            document.getElementById(
                "editModal"
            );

        const editOverlay =
            document.getElementById(
                "editOverlay"
            );

        const editCloseBtn =
            document.getElementById(
                "editCloseBtn"
            );

        const editName =
            document.getElementById(
                "editName"
            );

        const editPhone =
            document.getElementById(
                "editPhone"
            );

        const editVehicle =
            document.getElementById(
                "editVehicle"
            );

        const editNotes =
            document.getElementById(
                "editNotes"
            );

        const editDate =
            document.getElementById(
                "editDate"
            );

        const editService =
            document.getElementById(
                "editService"
            );

        const editTime =
            document.getElementById(
                "editTime"
            );

        const editMessage =
            document.getElementById(
                "editMessage"
            );

        const editSaveBtn =
            document.getElementById(
                "editSaveBtn"
            );


        // ==================================================
        // PROTEÇÃO DO LOGIN
        // ==================================================

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (
                error ||
                !data ||
                !data.user
            ) {

                window.location.replace(
                    "login.html"
                );

                return;
            }


            if (
                loggedUser
            ) {

                loggedUser.innerHTML =
                    `Logado como: <strong>${data.user.email}</strong>`;
            }

            document.body.classList.remove(
                "admin-loading"
            );


            console.log(
                "✅ Admin autenticado no Supabase."
            );

        } catch (
            error
        ) {

            console.error(
                "Erro ao validar usuário:",
                error
            );


            window.location.replace(
                "login.html"
            );

            return;
        }


        if (
            !agendaEl
        ) {

            console.error(
                "Elemento #agenda não encontrado."
            );

            return;
        }


        // ==================================================
        // ESTADO
        // ==================================================

        let currentStatusFilter =
            "all";

        let editingBooking =
            null;

        let allBookingsCache =
            [];


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


            return `${year}-${month}-${day}`;
        }


        function formatToday() {

            return formatDate(
                new Date()
            );
        }


        function formatTomorrow() {

            const tomorrow =
                new Date();

            tomorrow.setDate(
                tomorrow.getDate() + 1
            );

            return formatDate(
                tomorrow
            );
        }


        function formatDateForDisplay(
            dateString
        ) {

            if (
                !dateString
            ) {

                return "Data não informada";
            }


            const date =
                new Date(
                    `${dateString}T12:00:00`
                );


            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    weekday:
                        "long",

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric"
                }
            ).format(
                date
            );
        }


        // ==================================================
        // SUPABASE - BUSCAR
        // ==================================================

        async function getAllBookings() {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "agendamentos"
                    )
                    .select(
                        `
                        id,
                        data,
                        horario,
                        servico,
                        nome,
                        telefone,
                        veiculo,
                        observacoes,
                        concluido,
                        criado_em
                        `
                    )
                    .order(
                        "data",
                        {
                            ascending:
                                true
                        }
                    )
                    .order(
                        "horario",
                        {
                            ascending:
                                true
                        }
                    );


            if (
                error
            ) {

                throw error;
            }


            return (
                Array.isArray(data)
                    ? data
                    : []
            ).map(
                item => ({

                    id:
                        item.id,

                    date:
                        item.data,

                    time:
                        item.horario,

                    serviceName:
                        item.servico,

                    name:
                        item.nome,

                    phone:
                        item.telefone,

                    vehicle:
                        item.veiculo,

                    notes:
                        item.observacoes || "",

                    completed:
                        Boolean(
                            item.concluido
                        ),

                    createdAt:
                        item.criado_em

                })
            );
        }


        // ==================================================
        // SUPABASE - ATUALIZAR
        // ==================================================

        async function updateBookingInDatabase(
            id,
            changes
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "agendamentos"
                    )
                    .update(
                        changes
                    )
                    .eq(
                        "id",
                        id
                    );


            if (
                error
            ) {

                throw error;
            }
        }


        // ==================================================
        // SUPABASE - EXCLUIR
        // ==================================================

        async function deleteBookingFromDatabase(
            id
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "agendamentos"
                    )
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (
                error
            ) {

                throw error;
            }
        }


        // ==================================================
        // RESUMO
        // ==================================================

        function updateSummary(
            bookings
        ) {

            const today =
                formatToday();


            if (
                totalBookingsEl
            ) {

                totalBookingsEl.textContent =
                    bookings.length;
            }


            if (
                todayBookingsEl
            ) {

                todayBookingsEl.textContent =
                    bookings.filter(
                        booking =>
                            booking.date === today
                    ).length;
            }


            if (
                pendingTodayBookingsEl
            ) {

                pendingTodayBookingsEl.textContent =
                    bookings.filter(
                        booking =>
                            booking.date === today &&
                            !booking.completed
                    ).length;
            }
        }


        // ==================================================
        // STATUS
        // ==================================================

        function setStatusFilter(
            status
        ) {

            currentStatusFilter =
                status;


            statusButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.status ===
                            status
                    );

                }
            );
        }


        // ==================================================
        // FILTROS
        // ==================================================

        function filterBookings(
            bookings
        ) {

            let result =
                [...bookings];


            const selectedDate =
                filterDateInput
                    ? filterDateInput.value
                    : "";


            if (
                selectedDate
            ) {

                result =
                    result.filter(
                        booking =>
                            booking.date ===
                            selectedDate
                    );
            }


            if (
                currentStatusFilter ===
                "pending"
            ) {

                result =
                    result.filter(
                        booking =>
                            !booking.completed
                    );
            }


            if (
                currentStatusFilter ===
                "completed"
            ) {

                result =
                    result.filter(
                        booking =>
                            booking.completed
                    );
            }


            const searchTerm =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            if (
                searchTerm
            ) {

                result =
                    result.filter(
                        booking => {

                            const text = [

                                booking.name,
                                booking.phone,
                                booking.vehicle,
                                booking.serviceName,
                                booking.notes

                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                            return text.includes(
                                searchTerm
                            );

                        }
                    );
            }


            return result;
        }


        // ==================================================
        // ORDENAÇÃO
        // ==================================================

        function orderBookingsForDay(
            bookings
        ) {

            return [...bookings].sort(
                (
                    a,
                    b
                ) => {

                    if (
                        a.completed !==
                        b.completed
                    ) {

                        return a.completed
                            ? 1
                            : -1;
                    }


                    return String(
                        a.time || ""
                    ).localeCompare(
                        String(
                            b.time || ""
                        )
                    );

                }
            );
        }


        function groupBookingsByDate(
            bookings
        ) {

            return bookings.reduce(
                (
                    groups,
                    booking
                ) => {

                    if (
                        !groups[
                            booking.date
                        ]
                    ) {

                        groups[
                            booking.date
                        ] = [];
                    }


                    groups[
                        booking.date
                    ].push(
                        booking
                    );


                    return groups;

                },
                {}
            );
        }

                // ==================================================
        // CONCLUIR
        // ==================================================

        async function markAsCompleted(
            booking
        ) {

            if (
                !booking ||
                !booking.id
            ) {

                return;
            }


            try {

                await updateBookingInDatabase(
                    booking.id,
                    {
                        concluido:
                            true
                    }
                );


                await renderBookings();

            } catch (
                error
            ) {

                console.error(
                    "Erro ao concluir:",
                    error
                );


                alert(
                    "Não foi possível concluir o agendamento."
                );
            }
        }


        // ==================================================
        // CANCELAR
        // ==================================================

        async function cancelBooking(
            booking
        ) {

            if (
                !booking ||
                !booking.id
            ) {

                return;
            }


            const confirmed =
                confirm(
                    `Deseja realmente cancelar o agendamento de ${booking.name || "Cliente"} às ${booking.time || "--:--"}?

O horário ficará disponível novamente.`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                await deleteBookingFromDatabase(
                    booking.id
                );


                await renderBookings();

            } catch (
                error
            ) {

                console.error(
                    "Erro ao cancelar:",
                    error
                );


                alert(
                    "Não foi possível cancelar o agendamento."
                );
            }
        }


        // ==================================================
        // MODAL
        // ==================================================

        function setEditMessage(
            message
        ) {

            if (
                editMessage
            ) {

                editMessage.textContent =
                    message;
            }
        }


        function closeEditModal() {

            if (
                editModal
            ) {

                editModal.classList.remove(
                    "show"
                );
            }


            editingBooking =
                null;


            setEditMessage(
                ""
            );
        }


        function openEditModal(
            booking
        ) {

            if (
                !editModal ||
                !editName ||
                !editPhone ||
                !editVehicle ||
                !editNotes ||
                !editDate ||
                !editService ||
                !editTime
            ) {

                return;
            }


            editingBooking =
                booking;


            editName.value =
                booking.name || "";

            editPhone.value =
                booking.phone || "";

            editVehicle.value =
                booking.vehicle || "";

            editNotes.value =
                booking.notes || "";

            editDate.value =
                booking.date || "";

            editService.value =
                booking.serviceName || "";

            editTime.value =
                booking.time || "";


            setEditMessage(
                ""
            );


            editModal.classList.add(
                "show"
            );
        }


        // ==================================================
        // CARD DO AGENDAMENTO
        // ==================================================

        function createBookingRow(
            booking
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "booking-row";


            if (
                booking.completed
            ) {

                row.classList.add(
                    "completed"
                );
            }


            const nameText =
                booking.name ||
                "Cliente";

            const phoneText =
                booking.phone ||
                "Telefone não informado";

            const vehicleText =
                booking.vehicle ||
                "Veículo não informado";

            const notesText =
                booking.notes ||
                "Nenhuma observação";

            const serviceText =
                booking.serviceName ||
                "Serviço não informado";


            const phoneNumbers =
                String(
                    booking.phone || ""
                ).replace(
                    /\D/g,
                    ""
                );


            row.innerHTML = `

                <div class="time">
                    ${booking.time || "--:--"}
                </div>

                <div>

                    <strong>
                        ${nameText}
                    </strong>

                    <small>
                        ${phoneText}
                    </small>

                    <div class="vehicle-info">

                        <span class="vehicle-label">
                            VEÍCULO
                        </span>

                        <span class="vehicle-name">
                            ${vehicleText}
                        </span>

                    </div>

                    <div class="booking-notes">

                        <strong>
                            Observações
                        </strong>

                        <div>
                            ${notesText}
                        </div>

                    </div>

                </div>

                <div>

                    <strong>
                        ${serviceText}
                    </strong>

                    <small>
                        Serviço escolhido
                    </small>

                </div>

                <div>

                    <strong>
                        ${formatDateForDisplay(
                            booking.date
                        )}
                    </strong>

                    <small>
                        Data do atendimento
                    </small>

                </div>

                <span
                    class="status-badge ${
                        booking.completed
                            ? "completed"
                            : "pending"
                    }"
                >

                    ${
                        booking.completed
                            ? "CONCLUÍDO"
                            : "PENDENTE"
                    }

                </span>

            `;


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "booking-actions";


            // CONCLUIR

            const completeButton =
                document.createElement(
                    "button"
                );


            completeButton.type =
                "button";

            completeButton.className =
                "btn-success";

            completeButton.disabled =
                booking.completed;

            completeButton.textContent =
                booking.completed
                    ? "Concluído"
                    : "Marcar como concluído";


            completeButton.addEventListener(
                "click",
                async () => {

                    await markAsCompleted(
                        booking
                    );

                }
            );


            actions.appendChild(
                completeButton
            );


            // EDITAR

            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";

            editButton.className =
                "btn-secondary";

            editButton.textContent =
                "Editar";


            editButton.addEventListener(
                "click",
                () => {

                    openEditModal(
                        booking
                    );

                }
            );


            actions.appendChild(
                editButton
            );


            // WHATSAPP

            if (
                phoneNumbers.length >= 10
            ) {

                const whatsappButton =
                    document.createElement(
                        "a"
                    );


                whatsappButton.className =
                    "btn-whatsapp";

                whatsappButton.textContent =
                    "WhatsApp";

                whatsappButton.target =
                    "_blank";

                whatsappButton.rel =
                    "noopener noreferrer";


                const message =
                    encodeURIComponent(

`Olá ${nameText}, tudo bem?

Entramos em contato sobre seu agendamento no Lava Rápido.

Veículo: ${vehicleText}
Serviço: ${serviceText}
Data: ${formatDateForDisplay(booking.date)}
Horário: ${booking.time}
Observações: ${notesText}`

                    );


                whatsappButton.href =
                    `https://wa.me/55${phoneNumbers}?text=${message}`;


                actions.appendChild(
                    whatsappButton
                );
            }


            // CANCELAR

            const cancelButton =
                document.createElement(
                    "button"
                );


            cancelButton.type =
                "button";

            cancelButton.className =
                "btn-danger";

            cancelButton.textContent =
                "Cancelar agendamento";


            cancelButton.addEventListener(
                "click",
                async () => {

                    await cancelBooking(
                        booking
                    );

                }
            );


            actions.appendChild(
                cancelButton
            );


            row.appendChild(
                actions
            );


            return row;
        }


        // ==================================================
        // RENDER
        // ==================================================

        function drawBookings(
            bookings
        ) {

            if (
                resultsCount
            ) {

                const total =
                    bookings.length;


                resultsCount.textContent =
                    `${total} agendamento${
                        total === 1
                            ? ""
                            : "s"
                    } exibido${
                        total === 1
                            ? ""
                            : "s"
                    }`;
            }


            agendaEl.innerHTML =
                "";


            if (
                bookings.length === 0
            ) {

                agendaEl.innerHTML = `

                    <div class="empty">
                        Nenhum agendamento encontrado.
                    </div>

                `;

                return;
            }


            const grouped =
                groupBookingsByDate(
                    bookings
                );


            Object.entries(
                grouped
            ).forEach(
                (
                    [
                        date,
                        dayBookings
                    ]
                ) => {

                    const group =
                        document.createElement(
                            "article"
                        );


                    group.className =
                        "day-group";


                    const ordered =
                        orderBookingsForDay(
                            dayBookings
                        );


                    const pendingCount =
                        dayBookings.filter(
                            booking =>
                                !booking.completed
                        ).length;


                    const title =
                        document.createElement(
                            "div"
                        );


                    title.className =
                        "day-title";


                    title.innerHTML = `

                        <span>
                            ${formatDateForDisplay(date)}
                        </span>

                        <span class="day-count">

                            ${dayBookings.length}
                            agendamento${
                                dayBookings.length === 1
                                    ? ""
                                    : "s"
                            }

                            ·

                            ${pendingCount}
                            pendente${
                                pendingCount === 1
                                    ? ""
                                    : "s"
                            }

                        </span>

                    `;


                    group.appendChild(
                        title
                    );


                    ordered.forEach(
                        booking => {

                            group.appendChild(
                                createBookingRow(
                                    booking
                                )
                            );

                        }
                    );


                    agendaEl.appendChild(
                        group
                    );

                }
            );
        }


        async function renderBookings() {

            agendaEl.innerHTML = `

                <div class="empty">
                    Carregando agendamentos...
                </div>

            `;


            try {

                allBookingsCache =
                    await getAllBookings();


                updateSummary(
                    allBookingsCache
                );


                drawBookings(
                    filterBookings(
                        allBookingsCache
                    )
                );


            } catch (
                error
            ) {

                console.error(
                    "Erro ao carregar painel:",
                    error
                );


                agendaEl.innerHTML = `

                    <div class="empty">
                        Não foi possível carregar os agendamentos do banco.
                    </div>

                `;
            }
        }


        // ==================================================
        // SALVAR EDIÇÃO
        // ==================================================

        if (
            editSaveBtn
        ) {

            editSaveBtn.addEventListener(
                "click",
                async () => {

                    if (
                        !editingBooking ||
                        !editingBooking.id
                    ) {

                        return;
                    }


                    const newName =
                        editName.value.trim();

                    const newPhone =
                        editPhone.value.trim();

                    const newVehicle =
                        editVehicle.value.trim();

                    const newNotes =
                        editNotes.value.trim();

                    const newDate =
                        editDate.value;

                    const newService =
                        editService.value;

                    const newTime =
                        editTime.value;


                    if (
                        !newName ||
                        !newPhone ||
                        !newVehicle ||
                        !newDate ||
                        !newService ||
                        !newTime
                    ) {

                        setEditMessage(
                            "Preencha todos os campos obrigatórios."
                        );

                        return;
                    }


                    const phoneNumbers =
                        newPhone.replace(
                            /\D/g,
                            ""
                        );


                    if (
                        phoneNumbers.length < 10
                    ) {

                        setEditMessage(
                            "Informe um telefone válido."
                        );

                        return;
                    }


                    const selectedDate =
                        new Date(
                            `${newDate}T12:00:00`
                        );


                    const today =
                        new Date();


                    today.setHours(
                        12,
                        0,
                        0,
                        0
                    );


                    if (
                        selectedDate < today
                    ) {

                        setEditMessage(
                            "Não é possível agendar para uma data passada."
                        );

                        return;
                    }


                    if (
                        selectedDate.getDay() === 0
                    ) {

                        setEditMessage(
                            "Não atendemos aos domingos."
                        );

                        return;
                    }


                    try {

                        editSaveBtn.disabled =
                            true;

                        editSaveBtn.textContent =
                            "Salvando...";


                        await updateBookingInDatabase(
                            editingBooking.id,
                            {
                                data:
                                    newDate,

                                horario:
                                    newTime,

                                servico:
                                    newService,

                                nome:
                                    newName,

                                telefone:
                                    newPhone,

                                veiculo:
                                    newVehicle,

                                observacoes:
                                    newNotes || null
                            }
                        );


                        closeEditModal();


                        await renderBookings();


                    } catch (
                        error
                    ) {

                        console.error(
                            "Erro ao editar:",
                            error
                        );


                        if (
                            error.code ===
                            "23505"
                        ) {

                            setEditMessage(
                                "Esse horário já está ocupado nessa data."
                            );

                        } else {

                            setEditMessage(
                                "Não foi possível salvar as alterações."
                            );
                        }


                    } finally {

                        editSaveBtn.disabled =
                            false;

                        editSaveBtn.textContent =
                            "Salvar alterações";
                    }

                }
            );
        }

                // ==================================================
        // FECHAR MODAL
        // ==================================================

        if (
            editCloseBtn
        ) {

            editCloseBtn.addEventListener(
                "click",
                closeEditModal
            );
        }


        if (
            editOverlay
        ) {

            editOverlay.addEventListener(
                "click",
                closeEditModal
            );
        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                        "Escape" &&

                    editModal &&
                    editModal.classList.contains(
                        "show"
                    )
                ) {

                    closeEditModal();
                }

            }
        );


        // ==================================================
        // FILTRO POR DATA
        // ==================================================

        if (
            filterBtn
        ) {

            filterBtn.addEventListener(
                "click",
                () => {

                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // HOJE
        // ==================================================

        if (
            todayBtn
        ) {

            todayBtn.addEventListener(
                "click",
                () => {

                    if (
                        filterDateInput
                    ) {

                        filterDateInput.value =
                            formatToday();
                    }


                    setStatusFilter(
                        "all"
                    );


                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // AMANHÃ
        // ==================================================

        if (
            tomorrowBtn
        ) {

            tomorrowBtn.addEventListener(
                "click",
                () => {

                    if (
                        filterDateInput
                    ) {

                        filterDateInput.value =
                            formatTomorrow();
                    }


                    setStatusFilter(
                        "all"
                    );


                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // MOSTRAR TODOS
        // ==================================================

        if (
            clearFilterBtn
        ) {

            clearFilterBtn.addEventListener(
                "click",
                () => {

                    if (
                        filterDateInput
                    ) {

                        filterDateInput.value =
                            "";
                    }


                    setStatusFilter(
                        "all"
                    );


                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // ATUALIZAR DO BANCO
        // ==================================================

        if (
            refreshBtn
        ) {

            refreshBtn.addEventListener(
                "click",
                async () => {

                    await renderBookings();

                }
            );
        }


        // ==================================================
        // FILTROS DE STATUS
        // ==================================================

        statusButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        setStatusFilter(
                            button.dataset.status ||
                            "all"
                        );


                        drawBookings(
                            filterBookings(
                                allBookingsCache
                            )
                        );

                    }
                );

            }
        );


        // ==================================================
        // PENDENTES HOJE
        // ==================================================

        if (
            pendingTodayCard
        ) {

            pendingTodayCard.addEventListener(
                "click",
                () => {

                    if (
                        filterDateInput
                    ) {

                        filterDateInput.value =
                            formatToday();
                    }


                    setStatusFilter(
                        "pending"
                    );


                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // BUSCA
        // ==================================================

        if (
            searchInput
        ) {

            searchInput.addEventListener(
                "input",
                () => {

                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // LIMPAR BUSCA
        // ==================================================

        if (
            clearSearchBtn
        ) {

            clearSearchBtn.addEventListener(
                "click",
                () => {

                    if (
                        searchInput
                    ) {

                        searchInput.value =
                            "";
                    }


                    drawBookings(
                        filterBookings(
                            allBookingsCache
                        )
                    );

                }
            );
        }


        // ==================================================
        // SAIR
        // ==================================================

        if (
            logoutBtn
        ) {

            logoutBtn.addEventListener(
                "click",
                async () => {

                    logoutBtn.disabled =
                        true;


                    try {

                        const {
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signOut();


                        if (
                            error
                        ) {

                            throw error;
                        }


                        window.location.replace(
                            "login.html"
                        );


                    } catch (
                        error
                    ) {

                        console.error(
                            "Erro ao sair:",
                            error
                        );


                        alert(
                            "Não foi possível encerrar a sessão."
                        );


                        logoutBtn.disabled =
                            false;
                    }

                }
            );
        }


        // ==================================================
        // SE A SESSÃO EXPIRAR
        // ==================================================

        supabaseClient
    .auth
    .onAuthStateChange(
        (
            event,
            session
        ) => {

            if (
                event === "SIGNED_OUT" ||
                !session
            ) {

                window.location.replace(
                    "login.html?motivo=sessao"
                );

            }

        }
    );


        // ==================================================
        // INICIA
        // ==================================================

        await renderBookings();


    }
);
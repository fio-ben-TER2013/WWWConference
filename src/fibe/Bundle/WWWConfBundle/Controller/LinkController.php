<?php

namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use IDCI\Bundle\SimpleScheduleBundle\Entity\Event;
use IDCI\Bundle\SimpleScheduleBundle\Form\EventType;
use IDCI\Bundle\SimpleScheduleBundle\Form\RecurChoiceType;
use IDCI\Bundle\SimpleScheduleBundle\Form\XPropertyType;
/**
 * Link controller.
 *
 * @Route("/admin/link")
 */
class LinkController extends Controller
{
/**
 * @Route("/", name="wwwconf_link_index")
 * @Template()
 */
    public function indexAction()
    {
        return array();
    }
    
/**
 * @Route("/create", name="wwwconf_link_create")
 * @Template()
 */
    public function createAction()
    {
        $entity = new Event();
        $form   = $this->createForm(new EventType(), $entity);

        return array(
            'entity' => $entity,
            'form'   => $form->createView(),
        );
    }
    
/**
 * @Route("/list", name="wwwconf_link_list")
 * @Template()
 */
    public function listAction()
    {
        return array();
    }
}
